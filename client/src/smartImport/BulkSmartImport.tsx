import { useParams } from "@solidjs/router";
import Client, { RecordModel } from "pocketbase";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "../PocketBaseContext";
import { smartImportFromModel } from "../client/util";
import { Grid } from "../grid/Grid";
import { RecipeCard } from "../grid/RecipeCard";
import { SmartImportErrorCard } from "../grid/SmartImportErrorCard";
import { SmartImport } from "../model/recipe";
import { LoadingInterstitial } from "./LoadingInterstitial";

export function BulkSmartImport() {
  const params = useParams();
  const pocketBase = usePocketBaseContext();
  const [smartImports, setSmartImports] = createSignal<SmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    if (pocketBase && params && params.id) {
      getBulkImportOrSubscribe(
        pocketBase(),
        params.id,
        (smartImports) => {
          setSmartImports(smartImports);
          setIsLoading(false);
        },
        (error) => {
          // TODO handle errors here
          console.log(error);
          setIsLoading(false);
        },
      );
    }
  });

  return (
    <Show
      when={!isLoading() && smartImports().length > 0}
      fallback={<LoadingInterstitial />}
    >
      <Grid
        sections={{
          Succeeded: smartImports()
            .filter((smartImport) => smartImport.status === "success")
            .map((smartImport) => smartImport.recipes)
            .reduce(function (elem1, elem2) {
              return elem1.concat(elem2);
            })
            .map((recipe) => <RecipeCard recipe={recipe} />),
          Failed: smartImports()
            .filter((smartImport) => smartImport.status === "error")
            .map((smartImport) => (
              <SmartImportErrorCard smartImport={smartImport} />
            )),
        }}
      />
    </Show>
  );
}

/**
 * For the given bulkImportId, attempt to fetch it, all of its smartImports, and all of their recipes.
 * If its status indicates it is still in progress, subscribe to it and wait until it completes.
 * Once the bulkImport and its smartImports and their recipes have been fetched, pass the data to the success callback.
 */
function getBulkImportOrSubscribe(
  pocketBase: Client,
  bulkImportId: string,
  onBulkImportLoadSuccess: (smartImports: SmartImport[]) => void,
  onBulkImportLoadError: (error: Error) => void,
) {
  pocketBase
    .collection("bulkSmartImports")
    .getFirstListItem(pocketBase.filter(`id = "${bulkImportId}"`))
    .then((bulkImportModel) => {
      if (bulkImportModel.status === "processing") {
        setTimeout(() => {
          pocketBase.collection("bulkSmartImports").unsubscribe(bulkImportId);
          onBulkImportLoadError(new Error("timeout"));
        }, 90000);
        pocketBase
          .collection("bulkSmartImports")
          .subscribe(bulkImportId, (event) => {
            if (
              event.record.status === "success" ||
              event.record.status === "error"
            ) {
              fetchSmartImportResults(
                pocketBase,
                event.record.imports,
                onBulkImportLoadSuccess,
                onBulkImportLoadError,
              );
            }
          });
      } else {
        fetchSmartImportResults(
          pocketBase,
          bulkImportModel.imports,
          onBulkImportLoadSuccess,
          onBulkImportLoadError,
        );
      }
    });
}

function fetchSmartImportResults(
  pocketBase: Client,
  smartImportIds: string[],
  onBulkImportLoadSuccess: (smartImports: SmartImport[]) => void,
  onBulkImportLoadError: (error: Error) => void,
) {
  // get all of the smartImports with the given IDs
  const smartImportFilterString =
    `id = "${smartImportIds[0]}"` +
    smartImportIds.map((id) => ` || id = "${id}"`).join(" ");
  pocketBase
    .collection("smartImports")
    .getFullList({
      filter: pocketBase.filter(smartImportFilterString),
    })
    .then((smartImportModels) => {
      const recipeIds = smartImportModels
        .filter(
          (smartImportModel) =>
            smartImportModel.recipes && smartImportModel.recipes.length > 0,
        )
        .map((smartImportModel) => smartImportModel.recipes);

      const recipeFilter = recipeIds.map((id) => `id = "${id}"`).join(" || ");

      // get all of their recipes
      return Promise.all([
        Promise.resolve(smartImportModels),
        pocketBase.collection("recipes").getFullList({
          filter: pocketBase.filter(recipeFilter),
        }),
      ]);
    })
    .then(([smartImportModels, recipes]) => {
      // hydrate the smartImport objects with the recipe data
      const recipeMap = recipeModelListToMap(recipes);
      const smartImports = smartImportModels.map((smartImportModel) => {
        const smartImport = smartImportFromModel(smartImportModel);
        smartImport.recipes = smartImportModel.recipes.map(
          (recipeId: string) => recipeMap[recipeId],
        );
        return smartImport;
      });

      return smartImports;
    })
    .then((smartImports) => {
      onBulkImportLoadSuccess(smartImports);
    })
    .catch((err) => {
      onBulkImportLoadError(err);
    });
}

function recipeModelListToMap(recipes: RecordModel[]) {
  const map: { [key: string]: RecordModel } = {};
  for (const recipe of recipes) {
    map[recipe.id] = recipe;
  }
  return map;
}
