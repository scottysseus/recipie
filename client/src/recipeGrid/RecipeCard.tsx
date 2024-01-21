import { Recipe } from "../model/recipe";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div class="max-w-xs border border-black p-2">
      <h1 class="mb-2 text-sm">{recipe.name}</h1>
      <p class="text-xs">{recipe.ingredients.length || "???"} ingredients</p>
      <p class="text-xs">Prep: {recipe.prepTimeMinutes || "???"} min</p>
      <p class="text-xs">Total: {recipe.totalTimeMinutes || "???"} min</p>
    </div>
  );
}
