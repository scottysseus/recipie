import { useParams } from "@solidjs/router";
import Client from "pocketbase";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "../PocketBaseContext";
import { recipeFromModel, smartImportFromModel } from "../client/util";
import { SmartImport } from "../model/recipe";
import { RecipeGrid } from "../recipeGrid/RecipeGrid";
import { LoadingInterstitial } from "./LoadingInterstitial";

export function BulkSmartImport() {
  const params = useParams();
  const pocketBase = usePocketBaseContext();
  const [smartImports, setSmartImports] = createSignal<SmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    if (pocketBase && params && params.id) {
      subscribeToBulkSmartImport(
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
      <RecipeGrid
        sections={{
          Succeeded: smartImports()
            .filter((smartImport) => smartImport.status === "success")
            .map((smartImport) => smartImport.recipes)
            .reduce(function (elem1, elem2) {
              return elem1.concat(elem2);
            }),
        }}
      />
    </Show>
  );
}

function subscribeToBulkSmartImport(
  pocketBase: Client,
  bulkImportId: string,
  onImportFinished: (smartImports: SmartImport[]) => void,
  onImportError: (error: Error) => void,
) {
  pocketBase
    .collection("bulkSmartImports")
    .getFirstListItem(pocketBase.filter(`id = "${bulkImportId}"`))
    .then((bulkImportModel) => {
      if (bulkImportModel.status === "processing") {
        setTimeout(() => {
          pocketBase.collection("bulkSmartImports").unsubscribe(bulkImportId);
          onImportError(new Error("timeout"));
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
                onImportFinished,
                onImportError,
              );
            }
          });
      } else {
        fetchSmartImportResults(
          pocketBase,
          bulkImportModel.imports,
          onImportFinished,
          onImportError,
        );
      }
    });
}

function fetchSmartImportResults(
  pocketBase: Client,
  ids: string[],
  onImportFinished: (smartImports: SmartImport[]) => void,
  onImportError: (error: Error) => void,
) {
  const filterString =
    `id = "${ids[0]}"` + ids.map((id) => ` || id = "${id}"`).join(" ");
  pocketBase
    .collection("smartImports")
    .getFullList({
      filter: pocketBase.filter(filterString),
    })
    .then((smartImportModels) => {
      return Promise.all(
        smartImportModels
          .filter(
            (smartImportModel) =>
              smartImportModel.recipes && smartImportModel.recipes.length > 0,
          )
          .map((smartImportModel) => {
            return pocketBase
              .collection("recipes")
              .getFullList({
                filter: pocketBase.filter(
                  `id = "${smartImportModel.recipes[0]}"` +
                    smartImportModel.recipes
                      .map((id: string) => ` || id = "${id}"`)
                      .join(" "),
                ),
              })
              .then((recipes) => {
                const smartImport = smartImportFromModel(smartImportModel);
                smartImport.recipes = recipes.map(recipeFromModel);
                return smartImport;
              });
          }),
      );
    })
    .then((smartImports) => {
      onImportFinished(smartImports);
    })
    .catch((err) => {
      onImportError(err);
    });
}
