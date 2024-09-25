import { useParams } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { LoadingInterstitial } from "src/components/common/LoadingInterstitial";
import { Recipe } from "src/components/common/Recipe";
import { ingredientFromModel, recipeFromModel } from "src/lead/util";
import { Recipe as RecipeRecord } from "src/model/model";

export function SmartImportRecipe() {
  const params = useParams();
  const pocketBase = usePocketBaseContext();
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [recipe, setRecipe] = createSignal<RecipeRecord | undefined>(undefined);

  createEffect(() => {
    if (pocketBase && params && params.smartImportId) {
      pocketBase()
        .collection("smartImports")
        .getFirstListItem(pocketBase().filter(`id = "${params.smartImportId}"`))
        .then(() => {
          // TODO do we need the smartImport model here?
          return pocketBase()
            .collection("recipes")
            .getFirstListItem(pocketBase().filter(`id = "${params.recipeId}"`));
        })
        .then((recipeModel) => {
          return Promise.all([
            Promise.resolve(recipeModel),
            pocketBase()
              .collection("ingredients")
              .getFullList({
                filter: pocketBase().filter(
                  recipeModel.ingredients
                    .map((ingredientId: string) => `id = "${ingredientId}"`)
                    .join(" || "),
                ),
              }),
          ]);
        })
        .then(([recipeModel, ingredientModels]) => {
          const recipe = recipeFromModel(recipeModel);
          recipe.ingredients = ingredientModels.map(ingredientFromModel);
          setRecipe(recipe);
        })
        .finally(() => setIsLoading(false));
    }
  });

  return (
    <Show when={!isLoading()} fallback={<LoadingInterstitial />}>
      <ActionBar>
        <a
          class="hover:underline"
          href={`/app/bulkSmartImports/${params.bulkSmartImportId}`}
        >
          Back
        </a>
      </ActionBar>
      <Recipe recipe={recipe()!} />
    </Show>
  );
}
