import { For } from "solid-js";
import { toLocalizedDateTimeString } from "../../lead/util";
import { Ingredient, Recipe as RecipeRecord } from "../../model/model";

export function Recipe({ recipe }: { recipe: RecipeRecord }) {
  return (
    <>
      <p class="text-gray-400">{recipe.isDraft ? "Draft recipe" : "Recipe"}</p>
      <h1 class="text-xl">{recipe.name}</h1>
      <p class="text-gray-400">
        From {toLocalizedDateTimeString(recipe.created)}
      </p>
      <h2 class="mb-6 mt-6">Ingredients</h2>
      <ul class="list-disc">
        <For each={recipe.ingredients}>
          {(ingredient: Ingredient) => (
            <li class="ml-6 text-sm">
              {ingredient.name}, {ingredient.quantity} {ingredient.unit}
            </li>
          )}
        </For>
      </ul>
      <h2 class="mb-6 mt-6">Instructions</h2>
      <ol class="list-decimal">
        <For
          each={
            (recipe.instructions as unknown as { instructions: string[] })
              .instructions
          }
        >
          {(instruction: string) => <li class="ml-6 text-sm">{instruction}</li>}
        </For>
      </ol>
    </>
  );
}
