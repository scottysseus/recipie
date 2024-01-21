import { Show, createEffect, createSignal } from "solid-js";
import { useAuthContext } from "./AuthContext";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { recipeFromModel } from "./client/util";
import { Recipe } from "./model/recipe";
import { RecipeGrid } from "./recipeGrid/RecipeGrid";

export function Landing() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [drafts, setDrafts] = createSignal<Recipe[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    pocketBase()
      .collection("recipes")
      .getList(1, 12, {
        filter: pocketBase().filter(
          `creator = "${authData()?.id}" && isDraft = true`,
        ),
      })
      .then((result) => {
        setDrafts(result.items.map(recipeFromModel));
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
      <RecipeGrid sections={{ Drafts: drafts() }} />
    </Show>
  );
}
