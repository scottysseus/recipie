import { Show, createEffect, createSignal } from "solid-js";
import { ActionBar } from "./ActionBar";
import { useAuthContext } from "./AuthContext";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { recipeFromModel } from "./client/util";
import { Grid } from "./grid/Grid";
import { RecipeCard } from "./grid/RecipeCard";
import { Recipe } from "./model/recipe";

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
    <>
      <ActionBar>
        <a class="hover:underline" href="/app/bulkSmartImports/new">
          + New Recipe
        </a>
      </ActionBar>
      <Show
        when={!isLoading()}
        fallback={
          <div class="flex justify-center">
            <Loader />
          </div>
        }
      >
        <Grid
          sections={{
            Drafts: drafts().map((draft) => <RecipeCard recipe={draft} />),
          }}
        />
      </Show>
    </>
  );
}
