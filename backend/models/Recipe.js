import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without this field (User-created recipes)
    },
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
    prepTimeMinutes: {
      type: Number,
      default: 0,
    },
    cookTimeMinutes: {
      type: Number,
      default: 0,
    },
    servings: {
      type: Number,
      default: 1,
    },
    image: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'User',
    },
  },
  { timestamps: true }
);

// Text index for fast name searches
RecipeSchema.index({ name: 'text' });

const Recipe = mongoose.model('Recipe', RecipeSchema);

export default Recipe;
