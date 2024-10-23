import { Card } from "src/components/list/Card";
import { Recipe } from "src/model/model";

export function RecipeCard(props: { recipe: Recipe; path: string }) {
  return (
    <Card
      title={props.recipe.name}
      subtitle={props.recipe.isDraft ? "Draft" : ""}
      path={props.path}
    >
      <p class="text-xs">
        {props.recipe.ingredients.length || "???"} ingredients
      </p>
      <p class="text-xs">Prep: {props.recipe.prepTimeMinutes || "???"} min</p>
      <p class="text-xs">Total: {props.recipe.totalTimeMinutes || "???"} min</p>
    </Card>
  );
}
