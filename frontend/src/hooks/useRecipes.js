import axios from 'axios';

const BASE_URL = '/api/recipes';

export function useRecipes() {
  // ── Fetch all recipes (initial load) ──────────────────────────────────────
  const fetchAllRecipes = async () => {
    const { data } = await axios.get(BASE_URL);
    return data; // { source, recipes }
  };

  // ── Search recipes via smart proxy ────────────────────────────────────────
  const searchRecipes = async (query) => {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: { q: query },
    });
    return data; // { source, recipes }
  };

  // ── Create a new recipe ───────────────────────────────────────────────────
  const createRecipe = async (recipeData) => {
    const { data } = await axios.post(BASE_URL, recipeData);
    return data; // saved recipe object
  };

  // ── Update an existing recipe ─────────────────────────────────────────────
  const updateRecipe = async (id, recipeData) => {
    const { data } = await axios.put(`${BASE_URL}/${id}`, recipeData);
    return data; // updated recipe object
  };

  // ── Delete a recipe ───────────────────────────────────────────────────────
  const deleteRecipe = async (id) => {
    const { data } = await axios.delete(`${BASE_URL}/${id}`);
    return data;
  };

  return { fetchAllRecipes, searchRecipes, createRecipe, updateRecipe, deleteRecipe };
}
