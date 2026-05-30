import express from 'express';
import axios from 'axios';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// ─── GET /api/recipes ────────────────────────────────────────────────────────
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

// ─── GET /api/recipes/search?q=query ─────────────────────────────────────────
// Smart Caching Proxy:
//   1. Check local MongoDB first (case-insensitive regex on name)
//   2. If found → return with source: 'database'
//   3. If NOT found → hit DummyJSON API, upsert results, return with source: 'api'
router.get('/search', async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // Step 1: Search local DB
    const localResults = await Recipe.find({
      name: { $regex: query, $options: 'i' },
    });

    if (localResults.length > 0) {
      console.log(`[Cache HIT] "${query}" found in DB (${localResults.length} results)`);
      return res.json({ source: 'database', recipes: localResults });
    }

    // Step 2: Fetch from external API
    console.log(`[Cache MISS] "${query}" not in DB — fetching from DummyJSON...`);
    const { data } = await axios.get(
      `https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}`
    );

    if (!data.recipes || data.recipes.length === 0) {
      return res.json({ source: 'api', recipes: [] });
    }

    // Step 3: Map API response → Mongoose schema
    const mappedRecipes = data.recipes.map((r) => ({
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

    // Step 4: Upsert all recipes into DB (avoid duplicate ID crashes)
    const bulkOps = mappedRecipes.map((recipe) => ({
      updateOne: {
        filter: { id: recipe.id },
        update: { $set: recipe },
        upsert: true,
      },
    }));

    await Recipe.bulkWrite(bulkOps);

    // Step 5: Return newly saved records from DB so they include _id
    const savedRecipes = await Recipe.find({
      id: { $in: mappedRecipes.map((r) => r.id) },
    });

    console.log(`[Cache STORE] Saved ${savedRecipes.length} recipes from DummyJSON for "${query}"`);
    res.json({ source: 'api', recipes: savedRecipes });
  } catch (err) {
    console.error('GET /api/recipes/search error:', err.message);
    res.status(500).json({ message: 'Server error during search.' });
  }
});

// ─── POST /api/recipes ────────────────────────────────────────────────────────
// Create a new recipe (User-created)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      image,
    } = req.body;

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
// Update an existing recipe by its MongoDB _id
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
// Remove a recipe by its MongoDB _id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.json({ message: 'Recipe deleted successfully.', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/recipes/:id error:', err.message);
    res.status(500).json({ message: 'Server error deleting recipe.' });
  }
});

export default router;
