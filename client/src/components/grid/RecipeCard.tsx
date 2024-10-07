import { Card } from "src/components/grid/Card";
import { Recipe } from "src/model/model";

export function RecipeCard({ recipe, path }: { recipe: Recipe; path: string }) {
  return (
    <Card
      title={recipe.name}
      subtitle={recipe.isDraft ? "Draft" : ""}
      path={path}
    >
      <p class="text-xs">{recipe.ingredients.length || "???"} ingredients</p>
      <p class="text-xs">Prep: {recipe.prepTimeMinutes || "???"} min</p>
      <p class="text-xs">Total: {recipe.totalTimeMinutes || "???"} min</p>
    </Card>
  );
}
