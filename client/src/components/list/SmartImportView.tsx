import { useParams } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { Loader } from "src/components/common/Loader";
import { NamedHr } from "src/components/common/NamedHr";
import { RecipeListView } from "src/components/list/RecipeListView";
import {
  recipeFromModel,
  smartImportFromModel,
  toLocalizedDateTimeString,
} from "src/lead/util";
import { Recipe, SmartImport } from "src/model/model";

export function SmartImportView() {
  const params = useParams();
  const pocketBase = usePocketBaseContext()!;
  const [isLoading, setIsLoading] = createSignal(true);
  const [smartImport, setSmartImport] = createSignal<SmartImport | undefined>();
  const [recipes, setRecipes] = createSignal<Recipe[]>([]);

  createEffect(() => {
    if (params && params.id) {
      pocketBase()
        .collection("smartImports")
        .getFirstListItem(pocketBase().filter(`id = "${params.id}"`))
        .then((model) => {
          setSmartImport(smartImportFromModel(model));
          return pocketBase()
            .collection("recipes")
            .getFullList({
              filter: pocketBase().filter(getRecipesFilter(model.recipes)),
            });
        })
        .then((recipeModels) => {
          setRecipes(recipeModels.map(recipeFromModel));
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      console.log("params are missing an id", params);
    }
  });

  return (
    <>
      <NamedHr name={`Smart Import ${params.id ?? "???"}`} />

      <Show when={!isLoading()} fallback={<Loader />}>
        <p class="mb-2 text-xs italic">
          From {toLocalizedDateTimeString(smartImport()!.created)}
        </p>
        <p class="mb-4 text-xs">{smartImport()?.url}</p>
        <Show
          when={!isLoading() && smartImport()?.status !== "error"}
          fallback={
            <>
              <p class="mt-3">Smart import failed with error:</p>
              <p class="mt-3 italic">{smartImport()?.error?.error}</p>
            </>
          }
        >
          <Show
            when={recipes()?.length > 0}
            fallback={
              <div class="flex flex-col text-center">
                <p>No recipes extracted from the URL</p>
              </div>
            }
          >
            <RecipeListView recipes={recipes()} />
          </Show>
        </Show>
      </Show>
    </>
  );
}

function getRecipesFilter(recipeIds: string[]) {
  return 'id = "' + recipeIds.join('" || id = "') + '"';
}
