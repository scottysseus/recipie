import { For } from "solid-js";
import { Recipe } from "../model/recipe";
import { RecipeCard } from "./RecipeCard";

export function RecipeGridSection({
  name,
  recipes,
}: {
  name: string;
  recipes: Recipe[];
}) {
  return (
    <>
      <div class="mb-4 flex items-center justify-start">
        <p class="mr-8">{name}</p>
        <hr class="w-full border-black" color="black"></hr>
      </div>
      <div class="grid grid-flow-row">
        <For each={recipes}>
          {(recipe) => (
            <div class="mb-2">
              <RecipeCard recipe={recipe} />
            </div>
          )}
        </For>
      </div>
    </>
  );
}
