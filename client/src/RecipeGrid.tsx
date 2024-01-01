import { RecordModel } from "pocketbase";
import { For, Show, createEffect, createSignal } from "solid-js";
import { useAuthContext } from "./AuthContext";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { RecipeCard } from "./RecipeCard";

export function RecipeGrid() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [recipes, setRecipes] = createSignal<RecordModel[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    pocketBase()
      ?.collection("recipes")
      .getList(1, 2, {
        filter: pocketBase()?.filter(`creator = "${authData()?.id}"`),
      })
      .then((result) => {
        setRecipes(result.items);
      })
      .finally(() => setIsLoading(false));
  });

  return (
    <Show
      when={!isLoading()}
      fallback={
        <div class="flex justify-center">
          <Loader />
        </div>
      }
    >
      <Show when={recipes()?.length > 0} fallback={<RecipePlaceholder />}>
        <For each={recipes()}>
          {(recipe) => (
            <div class="mb-2">
              <RecipeCard recipe={recipe} />
            </div>
          )}
        </For>
      </Show>
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
