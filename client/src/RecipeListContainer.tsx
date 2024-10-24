import { UnsubscribeFunc } from "pocketbase";
import { Show, createEffect, createSignal } from "solid-js";
import { useAuthContext } from "src/AuthContext";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { Loader } from "src/components/common/Loader";
import { RecipeListView } from "src/components/list/RecipeListView";
import { recipeFromModel } from "src/lead/util";
import { Recipe } from "src/model/model";
import { arrayUpdateSubscriptionCallback } from "src/pb/util";

export function RecipeListContainer() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [recipes, setRecipes] = createSignal<Recipe[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() =>
    pocketBase()
      .collection("recipes")
      .getFullList({
        filter: pocketBase().filter(`creator = "${authData()?.id}"`),
      })
      .then((result) => {
        setRecipes(result.map(recipeFromModel));
      })
      .finally(() => setIsLoading(false)),
  );

  createEffect(
    async (prevUnsubscribe: Promise<UnsubscribeFunc> | undefined) => {
      if (prevUnsubscribe) {
        setIsLoading(true);
        await (
          await prevUnsubscribe
        )();
        setIsLoading(false);
      }
      return pocketBase()
        .collection("recipes")
        .subscribe(
          "*",
          (e) => {
            const newRecipe = recipeFromModel(e.record);
            arrayUpdateSubscriptionCallback(newRecipe, e.action, setRecipes);
          },
          {
            filter: pocketBase().filter(`creator = "${authData()?.id}"`),
          },
        );
    },
  );

  return (
    <>
      <ActionBar>
        <a class="underline" href="/app/smartImports/new">
          + Import
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
        <RecipeListView recipes={recipes()} />
      </Show>
    </>
  );
}
