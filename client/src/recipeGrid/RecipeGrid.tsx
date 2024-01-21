import { For, Show } from "solid-js";
import { Recipe } from "../model/recipe";
import { RecipeGridSection } from "./RecipeGridSection";

export type RecipeGridData = { [key: string]: Recipe[] };

export function RecipeGrid({ sections }: { sections: RecipeGridData }) {
  return (
    <Show when={!isEmpty(sections)} fallback={<RecipePlaceholder />}>
      <For each={Object.keys(sections)}>
        {(key) => <RecipeGridSection name={key} recipes={sections[key]} />}
      </For>
    </Show>
  );
}

function RecipePlaceholder() {
  return (
    <div class="flex flex-col text-center">
      <h1 class="mb-6 text-2xl">You have no recipes</h1>
      <p>Recipes you create will be visible here</p>
    </div>
  );
}

function isEmpty(data: RecipeGridData) {
  return !Object.keys(data).some((key) => data[key].length > 0);
}
