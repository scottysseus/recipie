import { useParams } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { LoadingInterstitial } from "src/components/common/LoadingInterstitial";
import { smartImportFromModel } from "src/lead/util";
import { SmartImport as SmartImportModel } from "src/model/model";

export function SmartImport() {
  const params = useParams();
  const pocketBase = usePocketBaseContext();
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [smartImport, setSmartImport] = createSignal<
    SmartImportModel | undefined
  >(undefined);

  createEffect(() => {
    if (pocketBase && params && params.smartImportId) {
      pocketBase()
        .collection("smartImports")
        .getFirstListItem(pocketBase().filter(`id = "${params.smartImportId}"`))
        .then((smartImportModel) => {
          setSmartImport(smartImportFromModel(smartImportModel));
        })
        .catch((e) => {
          console.log(e);
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
      <p class="text-gray-400">
        {smartImport()?.status === "error"
          ? "Failed smart import"
          : "Smart import"}
      </p>
      <h1 class="text-xl">{smartImport()?.id}</h1>
      <p class="text-s text-gray-400">{smartImport()?.url}</p>
      <hr class="mb-4 mt-4 w-full border-black" color="black"></hr>
      <Show when={smartImport()?.error}>
        <p class="mt-3">Smart import failed with error:</p>
        <p class="mt-3 italic">{smartImport()?.error?.error}</p>
      </Show>
    </Show>
  );
}
