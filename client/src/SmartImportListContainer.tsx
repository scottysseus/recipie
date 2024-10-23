import { UnsubscribeFunc } from "pocketbase";
import { Show, createEffect, createSignal } from "solid-js";
import { useAuthContext } from "src/AuthContext";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { Loader } from "src/components/common/Loader";
import { SmartImportListView } from "src/components/list/SmartImportListView";
import { smartImportFromModel } from "src/lead/util";
import { SmartImport } from "src/model/model";

export function SmartImportListContainer() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [smartImports, setSmartImports] = createSignal<SmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [statusFilter, setStatusFilter] = createSignal<string>("all");
  const [timeFilter, setTimeFilter] = createSignal<string>("today");

  createEffect(() => {
    pocketBase()
      .collection("smartImports")
      .getFullList({
        filter: pocketBase().filter(
          `creator = "${authData()?.id}" ${
            statusFilter() !== "all" ? `&& status = "${statusFilter()}"` : ""
          } ${getTimeFilterString(timeFilter())}`,
        ),
      })
      .then((result) => {
        setSmartImports(result.map(smartImportFromModel));
      })
      .finally(() => setIsLoading(false));
  });

  createEffect(
    async (prevUnsubscribe: Promise<UnsubscribeFunc> | undefined) => {
      if (prevUnsubscribe) {
        setIsLoading(true);
        await (
          await prevUnsubscribe
        )();
        setIsLoading(false);
      }

      return pocketBase()
        .collection("smartImports")
        .subscribe(
          "*",
          (e) => {
            const newImport = smartImportFromModel(e.record);
            switch (e.action) {
              case "create":
                setSmartImports((prev) => [newImport, ...prev]);
                break;
              case "update":
                setSmartImports((prev) => {
                  const index = prev.findIndex((smartImport) => {
                    return smartImport.id === newImport.id;
                  });
                  if (index) {
                    return [...prev.splice(index, 1, newImport)];
                  }
                  return prev;
                });
                break;
              case "delete":
                setSmartImports((prev) => {
                  const index = prev.findIndex((smartImport) => {
                    return smartImport.id === newImport.id;
                  });
                  if (index) {
                    if (prev.length > 1) {
                      return [...prev.splice(index, 1)];
                    }
                    return [];
                  }
                  return prev;
                });
                break;
            }
          },
          {
            filter: pocketBase().filter(`creator = "${authData()?.id}"`),
          },
        );
    },
  );

  return (
    <>
      <ActionBar>
        <select
          class="mr-3 bg-white"
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All</option>
          <option value="success">Successful</option>
          <option value="processing">In Progress</option>
          <option value="error">Failed</option>
        </select>
        <select
          class="bg-white"
          onChange={(event) => setTimeFilter(event.target.value)}
        >
          <option value="today">Today</option>
          <option value="">All time</option>
        </select>
      </ActionBar>
      <Show
        when={!isLoading()}
        fallback={
          <div class="flex justify-center">
            <Loader />
          </div>
        }
      >
        <SmartImportListView smartImports={smartImports()} />
      </Show>
    </>
  );
}

function getTimeFilterString(timeFilter: string) {
  if (!timeFilter) {
    return "";
  }

  if (timeFilter === "today") {
    return " && (created >= @todayStart && created < @todayEnd)";
  }

  return "";
}
