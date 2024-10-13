import { For, Show } from "solid-js";
import { NamedHr } from "src/components/common/NamedHr";
import { RecipeCard } from "src/components/list/RecipeCard";
import { Recipe } from "src/model/model";

export function RecipeListView({ recipes }: { recipes: Recipe[] }) {
  return (
    <>
      <NamedHr name="Recipes" />
      <Show when={recipes.length > 0} fallback={Placeholder()}>
        <div class="flex flex-col">
          <For each={recipes}>
            {(recipe) => (
              <div class="mb-3">
                <RecipeCard
                  recipe={recipe}
                  path={`/app/recipes/${recipe.id}`}
                />
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

function Placeholder() {
  return (
    <div class="flex flex-col text-center">
      <h1 class="mb-3">You have no recipes</h1>
      <p>Recipes you create will be visible here</p>
    </div>
  );
}
