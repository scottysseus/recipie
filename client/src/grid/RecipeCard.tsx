import { Recipe } from "../model/recipe";
import { Card } from "./Card";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card title={recipe.name}>
      <p class="text-xs">{recipe.ingredients.length || "???"} ingredients</p>
      <p class="text-xs">Prep: {recipe.prepTimeMinutes || "???"} min</p>
      <p class="text-xs">Total: {recipe.totalTimeMinutes || "???"} min</p>
    </Card>
  );
}
