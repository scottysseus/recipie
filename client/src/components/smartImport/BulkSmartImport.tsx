import { useParams } from "@solidjs/router";
import Client, { RecordModel } from "pocketbase";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { LoadingInterstitial } from "src/components/common/LoadingInterstitial";
import { Grid } from "src/components/grid/Grid";
import { RecipeCard } from "src/components/grid/RecipeCard";
import { SmartImportErrorCard } from "src/components/smartImport/SmartImportErrorCard";
import {
  bulkSmartImportFromModel,
  smartImportFromModel,
  toLocalizedDateTimeString,
} from "src/lead/util";
import {
  BulkSmartImport as BulkSmartImportRecord,
  Recipe,
  SmartImport,
} from "src/model/model";

export function BulkSmartImport() {
  const params = useParams();
  const pocketBase = usePocketBaseContext();
  const [bulkImport, setBulkImport] = createSignal<
    BulkSmartImportRecord | undefined
  >();
  const [smartImports, setSmartImports] = createSignal<SmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    if (pocketBase && params && params.id) {
      getBulkImportOrSubscribe(
        pocketBase(),
        params.id,
        (bulkSmartImport) => setBulkImport(bulkSmartImport),
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
      <ActionBar>
        <a class="hover:underline" href="/app">
          Back
        </a>
      </ActionBar>
      <p class="mb-2 text-gray-600">Bulk Smart Import</p>
      <h1 class="text-2xl">{params.id}</h1>
      <Show when={bulkImport()?.created}>
        <h2 class="mb-8 text-gray-600">
          from {toLocalizedDateTimeString(bulkImport()?.created!)}
        </h2>
      </Show>
      <Grid
        sections={{
          "Succeeded - saved": selectSaved(smartImports()).map(
            (smartImportAndRecipe) =>
              getCardForRecipe(params.id, smartImportAndRecipe),
          ),

          "Succeeded - drafts": selectDrafts(smartImports()).map(
            (smartImportAndRecipe) =>
              getCardForRecipe(params.id, smartImportAndRecipe),
          ),

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
  onBulkImportLoadSuccess: (bulkSmartImport: BulkSmartImportRecord) => void,
  onSmartImportLoadSuccess: (smartImports: SmartImport[]) => void,
  onError: (error: Error) => void,
) {
  pocketBase
    .collection("bulkSmartImports")
    .getFirstListItem(pocketBase.filter(`id = "${bulkImportId}"`))
    .then((bulkImportModel) => {
      onBulkImportLoadSuccess(bulkSmartImportFromModel(bulkImportModel));
      if (bulkImportModel.status === "processing") {
        setTimeout(() => {
          pocketBase.collection("bulkSmartImports").unsubscribe(bulkImportId);
          onError(new Error("timeout"));
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
                onSmartImportLoadSuccess,
                onError,
              );
            }
          });
      } else {
        fetchSmartImportResults(
          pocketBase,
          bulkImportModel.imports,
          onSmartImportLoadSuccess,
          onError,
        );
      }
    });
}

function fetchSmartImportResults(
  pocketBase: Client,
  smartImportIds: string[],
  onSmartImportLoadSuccess: (smartImports: SmartImport[]) => void,
  onError: (error: Error) => void,
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
      onSmartImportLoadSuccess(smartImports);
    })
    .catch((err) => {
      onError(err);
    });
}

function selectSuccesses(smartImports: SmartImport[]) {
  return smartImports
    .filter((smartImport) => smartImport.status === "success")
    .map((smartImport) =>
      smartImport.recipes.map((recipe) => ({ recipe, smartImport })),
    )
    .reduce(function (elem1, elem2) {
      return elem1.concat(elem2);
    }, []);
}

function selectSaved(smartImports: SmartImport[]) {
  return selectSuccesses(smartImports).filter(
    (smartImportAndRecipe) => !smartImportAndRecipe.recipe.isDraft,
  );
}

function selectDrafts(smartImports: SmartImport[]) {
  return selectSuccesses(smartImports).filter(
    (smartImportAndRecipe) => smartImportAndRecipe.recipe.isDraft,
  );
}

function getCardForRecipe(
  bulkImportId: string,
  smartImportAndRecipe: {
    recipe: Recipe;
    smartImport: SmartImport;
  },
) {
  return (
    <RecipeCard
      recipe={smartImportAndRecipe.recipe}
      path={`/app/bulkSmartImports/${bulkImportId}/smartImports/${smartImportAndRecipe.smartImport.id}/recipes/${smartImportAndRecipe.recipe.id}`}
    />
  );
}

function recipeModelListToMap(recipes: RecordModel[]) {
  const map: { [key: string]: RecordModel } = {};
  for (const recipe of recipes) {
    map[recipe.id] = recipe;
  }
  return map;
}
