import { Show, createEffect, createSignal } from "solid-js";
import { ActionBar } from "./ActionBar";
import { useAuthContext } from "./AuthContext";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { Grid } from "./grid/Grid";
import { bulkSmartImportFromModel } from "./lead/util";
import { BulkSmartImport } from "./model/model";
import { BulkSmartImportCard } from "./smartImport/BulkImportCard";

export function Landing() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [drafts, setDrafts] = createSignal<BulkSmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(() => {
    pocketBase()
      .collection("bulkSmartImports")
      .getList(1, 12, {
        filter: pocketBase().filter(`creator = "${authData()?.id}"`),
      })
      .then((result) => {
        setDrafts(result.items.map(bulkSmartImportFromModel));
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
            "Draft Imports": drafts().map((draft) => (
              <BulkSmartImportCard bulkSmartImport={draft} />
            )),
          }}
        />
      </Show>
    </>
  );
}
