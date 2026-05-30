import axios from 'axios';

const BASE_URL = '/api/recipes';

export function useRecipes() {
  // ── Fetch paginated recipes (initial load + infinite scroll) ──────────────
  const fetchAllRecipes = async (page = 1, limit = 8) => {
    const { data } = await axios.get(BASE_URL, { params: { page, limit } });
    return data; // { source, recipes, total, page, totalPages, hasMore }
  };

  // ── Search recipes via smart proxy ────────────────────────────────────────
  const searchRecipes = async (query) => {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: { q: query },
    });
    return data; // { dbRecipes, apiRecipes, total }
  };

  // ── Create a new recipe ───────────────────────────────────────────────────
  const createRecipe = async (recipeData) => {
    const { data } = await axios.post(BASE_URL, recipeData);
    return data;
  };

  // ── Update an existing recipe ─────────────────────────────────────────────
  const updateRecipe = async (id, recipeData) => {
    const { data } = await axios.put(`${BASE_URL}/${id}`, recipeData);
    return data;
  };

  // ── Delete a recipe ───────────────────────────────────────────────────────
  const deleteRecipe = async (id) => {
    const { data } = await axios.delete(`${BASE_URL}/${id}`);
    return data;
  };

  return { fetchAllRecipes, searchRecipes, createRecipe, updateRecipe, deleteRecipe };
}
