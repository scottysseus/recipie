import Client from "pocketbase";
import { Match, Switch, createSignal } from "solid-js";
import { usePocketBaseContext } from "../PocketBaseContext";
import { Recipe } from "../model/recipe";
import { LoadingInterstitial } from "./LoadingInterstitial";
import { Overview } from "./Overview";
import { RecipeEntry } from "./RecipeEntry";

export function SmartImport() {
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
        <Overview successes={[]} failures={[]} error={""} />
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
  recipes: Recipe[];
  error: string;
}

function getDefaultSmartImportStateProps(): SmartImportStateProps {
  return {
    bulkImportId: "",
    isLoading: false,
    recipes: [],
    error: "",
  };
}

function getState(props: SmartImportStateProps): SmartImportState {
  if (props.isLoading && props.bulkImportId) {
    return SmartImportState.LOADING;
  }

  if (!props.isLoading && props.bulkImportId) {
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

function finishProcessingImport(
  props: SmartImportStateProps,
  success: boolean,
) {
  // TODO handle success = false here
  return Object.assign({}, props, {
    isLoading: false,
    error: success ? "" : "an error was encountered",
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
        onImportFinished(
          finishProcessingImport(props, event.record.status === "success"),
        );
      }
    });
}
