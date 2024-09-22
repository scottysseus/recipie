import { Show, createEffect, createSignal } from "solid-js";
import { useAuthContext } from "src/AuthContext";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { Loader } from "src/components/common/Loader";
import { Grid } from "src/components/grid/Grid";
import { BulkSmartImportCard } from "src/components/smartImport/BulkImportCard";
import { Button } from "src/components/ui/button";
import { bulkSmartImportFromModel } from "src/lead/util";
import { BulkSmartImport } from "src/model/model";

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
        <Button>New Recipe</Button>
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
