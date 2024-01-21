import Client from "pocketbase";
import { Match, Switch, createSignal } from "solid-js";
import { usePocketBaseContext } from "../PocketBaseContext";
import { recipeFromModel, smartImportFromModel } from "../client/util";
import { SmartImport } from "../model/recipe";
import { LoadingInterstitial } from "./LoadingInterstitial";
import { Overview } from "./Overview";
import { RecipeEntry } from "./RecipeEntry";

export function SmartImportWizard() {
  const [stateProps, setStateProps] = createSignal(
    getDefaultSmartImportStateProps(),
  );
  const pocketBase = usePocketBaseContext()!;

  return (
    <Switch>
      <Match when={getState(stateProps()) === SmartImportState.RECIPE_ENTRY}>
        <RecipeEntry
          setBulkImportId={(id) => {
            setStateProps(startProcessingImport(stateProps(), id));
            subscribeToBulkSmartImport(pocketBase()!, stateProps(), (props) =>
              setStateProps(props),
            );
          }}
        />
      </Match>
      <Match when={getState(stateProps()) === SmartImportState.LOADING}>
        <LoadingInterstitial />
      </Match>
      <Match when={getState(stateProps()) === SmartImportState.OVERVIEW}>
        <Overview smartImports={stateProps().smartImports} />
      </Match>
    </Switch>
  );
}

enum SmartImportState {
  RECIPE_ENTRY,
  LOADING,
  OVERVIEW,
  EDIT_RECIPE,
  CONFIRM,
}

interface SmartImportStateProps {
  bulkImportId: string;
  isLoading: boolean;
  smartImports: SmartImport[];
  error: string;
}

function getDefaultSmartImportStateProps(): SmartImportStateProps {
  return {
    bulkImportId: "",
    isLoading: false,
    smartImports: [],
    error: "",
  };
}

function getState(props: SmartImportStateProps): SmartImportState {
  if (props.isLoading && props.bulkImportId) {
    return SmartImportState.LOADING;
  }

  if (!props.isLoading && props.bulkImportId && props.smartImports.length > 0) {
    return SmartImportState.OVERVIEW;
  }
  return SmartImportState.RECIPE_ENTRY;
}

function startProcessingImport(
  props: SmartImportStateProps,
  bulkImportId: string,
) {
  return Object.assign({}, props, { bulkImportId, isLoading: true });
}

function fetchSmartImportResults(
  pocketBase: Client,
  ids: string[],
  props: SmartImportStateProps,
  onImportFinished: (props: SmartImportStateProps) => void,
) {
  pocketBase
    .collection("smartImports")
    .getFullList({
      filter: pocketBase.filter(
        `id = "${ids[0]}"` + ids.map((id) => ` || id = "${id}"`),
      ),
    })
    .then((smartImportModels) => {
      return Promise.all(
        smartImportModels.map((smartImportModel) =>
          pocketBase
            .collection("recipes")
            .getFullList({
              filter: pocketBase.filter(
                `id = "${smartImportModel.recipes[0]}"` +
                  smartImportModel.recipes.map(
                    (id: string) => ` || id = "${id}"`,
                  ),
              ),
            })
            .then((recipes) => {
              const smartImport = smartImportFromModel(smartImportModel);
              smartImport.recipes = recipes.map(recipeFromModel);
              return smartImport;
            }),
        ),
      );
    })
    .then((smartImports) => {
      onImportFinished(finishProcessingImport(props, smartImports));
    })
    .catch((err) => {
      console.log(err);
    });
}

function finishProcessingImport(
  props: SmartImportStateProps,
  smartImports: SmartImport[],
) {
  // TODO handle success = false here
  return Object.assign({}, props, {
    isLoading: false,
    smartImports,
  });
}

function subscribeToBulkSmartImport(
  pocketBase: Client,
  props: SmartImportStateProps,
  onImportFinished: (props: SmartImportStateProps) => void,
) {
  setTimeout(() => {
    pocketBase.collection("bulkSmartImports").unsubscribe(props.bulkImportId);
  }, 15000);
  pocketBase
    .collection("bulkSmartImports")
    .subscribe(props.bulkImportId, (event) => {
      if (
        event.record.status === "success" ||
        event.record.status === "error"
      ) {
        fetchSmartImportResults(
          pocketBase,
          event.record.imports,
          props,
          onImportFinished,
        );
      }
    });
}
