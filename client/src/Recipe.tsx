import { For } from "solid-js";
import { toLocalizedDateTimeString } from "./lead/util";
import { Ingredient, Recipe as RecipeRecord } from "./model/model";

export function Recipe({ recipe }: { recipe: RecipeRecord }) {
  return (
    <>
      <p class="text-gray-400">{recipe.isDraft ? "Draft recipe" : "Recipe"}</p>
      <h1 class="text-xl">{recipe.name}</h1>
      <p class="text-gray-400">
        From {toLocalizedDateTimeString(recipe.created)}
      </p>
      <h2 class="mb-6 mt-6">Ingredients</h2>
      <ul>
        <For each={recipe.ingredients}>
          {(ingredient: Ingredient) => (
            <li class="text-sm">
              {ingredient.name}, {ingredient.quantity} {ingredient.unit}
            </li>
          )}
        </For>
      </ul>
      <h2 class="mb-6 mt-6">Instructions</h2>
      {/* {
        (recipe.instructions as unknown as { instructions: string[] })
          .instructions
      } */}
      <ol>
        <For
          each={
            (recipe.instructions as unknown as { instructions: string[] })
              .instructions
          }
        >
          {(instruction: string) => <li class="text-sm">{instruction}</li>}
        </For>
      </ol>
    </>
  );
}
