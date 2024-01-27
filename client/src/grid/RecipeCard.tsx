import { Recipe } from "../model/model";
import { Card } from "./Card";

export function RecipeCard({ recipe, path }: { recipe: Recipe; path: string }) {
  return (
    <Card title={recipe.name} path={path}>
      <p class="text-xs">{recipe.ingredients.length || "???"} ingredients</p>
      <p class="text-xs">Prep: {recipe.prepTimeMinutes || "???"} min</p>
      <p class="text-xs">Total: {recipe.totalTimeMinutes || "???"} min</p>
    </Card>
  );
}
