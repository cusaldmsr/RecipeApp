import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChefHat } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  image: '',
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  servings: '',
  ingredients: '',
  instructions: '',
};

function toFormState(recipe) {
  if (!recipe) return EMPTY_FORM;
  return {
    name: recipe.name || '',
    image: recipe.image || '',
    prepTimeMinutes: recipe.prepTimeMinutes ?? '',
    cookTimeMinutes: recipe.cookTimeMinutes ?? '',
    servings: recipe.servings ?? '',
    ingredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join('\n')
      : recipe.ingredients || '',
    instructions: Array.isArray(recipe.instructions)
      ? recipe.instructions.join('\n')
      : recipe.instructions || '',
  };
}

export default function RecipeModal({ isOpen, onClose, onSubmit, editTarget }) {
  const isEditing = Boolean(editTarget);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      setForm(toFormState(editTarget));
      setErrors({});
    }
  }, [isOpen, editTarget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Recipe name is required.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        image: form.image.trim(),
        prepTimeMinutes: Number(form.prepTimeMinutes) || 0,
        cookTimeMinutes: Number(form.cookTimeMinutes) || 0,
        servings: Number(form.servings) || 1,
        ingredients: form.ingredients
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: form.instructions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Modal submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <ChefHat className="h-5 w-5 text-emerald-400" />
            </div>
            <DialogTitle>
              {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? 'Update the details for this recipe.'
              : 'Fill in the details to add a new recipe to your vault.'}
          </DialogDescription>
        </DialogHeader>

        <form id="recipe-form" onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="recipe-name">Recipe Name *</Label>
            <Input
              id="recipe-name"
              name="name"
              placeholder="e.g. Creamy Garlic Pasta"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="recipe-image">Image URL</Label>
            <Input
              id="recipe-image"
              name="image"
              placeholder="https://example.com/recipe-image.jpg"
              value={form.image}
              onChange={handleChange}
            />
          </div>

          {/* Time + Servings row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="recipe-prep">Prep Time (min)</Label>
              <Input
                id="recipe-prep"
                name="prepTimeMinutes"
                type="number"
                min="0"
                placeholder="15"
                value={form.prepTimeMinutes}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipe-cook">Cook Time (min)</Label>
              <Input
                id="recipe-cook"
                name="cookTimeMinutes"
                type="number"
                min="0"
                placeholder="30"
                value={form.cookTimeMinutes}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipe-servings">Servings</Label>
              <Input
                id="recipe-servings"
                name="servings"
                type="number"
                min="1"
                placeholder="4"
                value={form.servings}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-1.5">
            <Label htmlFor="recipe-ingredients">
              Ingredients
              <span className="text-slate-500 font-normal ml-2 text-xs">(one per line)</span>
            </Label>
            <Textarea
              id="recipe-ingredients"
              name="ingredients"
              placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
              value={form.ingredients}
              onChange={handleChange}
              rows={5}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="recipe-instructions">
              Instructions
              <span className="text-slate-500 font-normal ml-2 text-xs">(one step per line)</span>
            </Label>
            <Textarea
              id="recipe-instructions"
              name="instructions"
              placeholder={"Preheat oven to 350°F\nMix dry ingredients\nAdd wet ingredients and stir until combined"}
              value={form.instructions}
              onChange={handleChange}
              rows={5}
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            id="modal-cancel-btn"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="modal-submit-btn"
            type="submit"
            form="recipe-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Recipe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
