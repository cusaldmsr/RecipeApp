import express from 'express';
import axios from 'axios';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// ─── GET /api/recipes ─────────────────────────────────────────────────────────
// Fetch ALL recipes from the local database (for initial page load)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json({ source: 'database', recipes });
  } catch (err) {
    console.error('GET /api/recipes error:', err.message);
    res.status(500).json({ message: 'Server error fetching recipes.' });
  }
});

// ─── GET /api/recipes/suggestions?q=query ────────────────────────────────────
// Fast typeahead: returns up to 6 recipe names from the local DB
router.get('/suggestions', async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const suggestions = await Recipe.find(
      { name: { $regex: query, $options: 'i' } },
      { name: 1, _id: 1, image: 1, source: 1 }
    )
      .limit(6)
      .lean();

    res.json({ suggestions });
  } catch (err) {
    console.error('GET /api/recipes/suggestions error:', err.message);
    res.status(500).json({ message: 'Server error fetching suggestions.' });
  }
});

// ─── GET /api/recipes/search?q=query ─────────────────────────────────────────
// Smart Hybrid Search:
//   1. Query local MongoDB for matching recipes  → dbRecipes
//   2. ALWAYS also query DummyJSON external API
//   3. Filter API results to only those NOT already in DB → apiRecipes (new)
//   4. Upsert the new API recipes into MongoDB
//   5. Return { dbRecipes, apiRecipes } so the frontend can show both with labels
router.get('/search', async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // ── Step 1: Search local DB ───────────────────────────────────────────────
    const dbRecipes = await Recipe.find({
      name: { $regex: query, $options: 'i' },
    }).lean();

    console.log(`[DB] "${query}" → ${dbRecipes.length} local result(s)`);

    // ── Step 2: Always fetch from external API ────────────────────────────────
    let apiRecipes = [];

    try {
      const { data } = await axios.get(
        `https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}`,
        { timeout: 8000 }
      );

      if (data.recipes && data.recipes.length > 0) {
        // Build a set of external IDs already present in the DB
        const existingExternalIds = new Set(
          dbRecipes.map((r) => r.id).filter(Boolean)
        );

        // Only keep API results that are NOT already stored locally
        const newFromApi = data.recipes.filter(
          (r) => !existingExternalIds.has(String(r.id))
        );

        console.log(
          `[API] "${query}" → ${data.recipes.length} total, ${newFromApi.length} new (not in DB)`
        );

        if (newFromApi.length > 0) {
          // Map to schema
          const mapped = newFromApi.map((r) => ({
            id: String(r.id),
            name: r.name,
            ingredients: r.ingredients || [],
            instructions: r.instructions || [],
            prepTimeMinutes: r.prepTimeMinutes || 0,
            cookTimeMinutes: r.cookTimeMinutes || 0,
            servings: r.servings || 1,
            image: r.image || '',
            source: 'DummyJSON',
          }));

          // Upsert into DB
          const bulkOps = mapped.map((recipe) => ({
            updateOne: {
              filter: { id: recipe.id },
              update: { $set: recipe },
              upsert: true,
            },
          }));

          await Recipe.bulkWrite(bulkOps);

          // Fetch from DB so they have _id
          apiRecipes = await Recipe.find({
            id: { $in: mapped.map((r) => r.id) },
          }).lean();

          console.log(`[STORE] Saved ${apiRecipes.length} new recipe(s) for "${query}"`);
        }
      }
    } catch (apiErr) {
      // External API failure should not break the whole search
      console.warn(`[API] External API error for "${query}":`, apiErr.message);
    }

    res.json({
      dbRecipes,       // recipes already in local DB
      apiRecipes,      // newly fetched from API (and now also saved to DB)
      total: dbRecipes.length + apiRecipes.length,
    });
  } catch (err) {
    console.error('GET /api/recipes/search error:', err.message);
    res.status(500).json({ message: 'Server error during search.' });
  }
});

// ─── POST /api/recipes ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, ingredients, instructions, prepTimeMinutes, cookTimeMinutes, servings, image } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: 'Recipe name is required.' });
    }

    const newRecipe = new Recipe({
      name,
      ingredients: ingredients || [],
      instructions: instructions || [],
      prepTimeMinutes: prepTimeMinutes || 0,
      cookTimeMinutes: cookTimeMinutes || 0,
      servings: servings || 1,
      image: image || '',
      source: 'User',
    });

    const saved = await newRecipe.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/recipes error:', err.message);
    res.status(500).json({ message: 'Server error creating recipe.' });
  }
});

// ─── PUT /api/recipes/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.json(updated);
  } catch (err) {
    console.error('PUT /api/recipes/:id error:', err.message);
    res.status(500).json({ message: 'Server error updating recipe.' });
  }
});

// ─── DELETE /api/recipes/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Recipe not found.' });}

    res.json({ message: 'Recipe deleted successfully.', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/recipes/:id error:', err.message);
    res.status(500).json({ message: 'Server error deleting recipe.' });
  }
});

export default router;
