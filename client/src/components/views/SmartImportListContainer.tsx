import { UnsubscribeFunc } from "pocketbase";
import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { useAuthContext } from "src/AuthContext";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { ActionBar } from "src/components/common/ActionBar";
import { Loader } from "src/components/common/Loader";
import { SmartImportListView } from "src/components/list/SmartImportListView";
import { smartImportFromModel } from "src/lead/util";
import { SmartImport } from "src/model/model";
import {
  arrayUpdateSubscriptionCallback,
  getDefaultUnsubscribeFunc,
} from "src/pb/util";

export function SmartImportListContainer() {
  const pocketBase = usePocketBaseContext()!;
  const [authData] = useAuthContext()!;
  const [smartImports, setSmartImports] = createSignal<SmartImport[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [statusFilter, setStatusFilter] = createSignal<string>("all");
  const [timeFilter, setTimeFilter] = createSignal<string>("today");

  const [unsubscribeFunc, setUnsubscribeFunc] = createSignal<
    Promise<UnsubscribeFunc>
  >(getDefaultUnsubscribeFunc());

  createEffect(() => {
    const filter = `creator = "${authData()?.id}" ${
      !statusFilter() || statusFilter() !== "all"
        ? `&& status = "${statusFilter()}"`
        : ""
    } ${getTimeFilterString(timeFilter())}`;

    pocketBase()
      .collection("smartImports")
      .getFullList({
        filter: pocketBase().filter(filter),
      })
      .then((result) => {
        setSmartImports(result.map(smartImportFromModel));
      })
      .finally(() => setIsLoading(false));
  });

  createEffect(
    async (prevUnsubscribe: Promise<UnsubscribeFunc> | undefined) => {
      if (prevUnsubscribe) {
        setUnsubscribeFunc(getDefaultUnsubscribeFunc());
        setIsLoading(true);
        await (
          await prevUnsubscribe
        )();
        setIsLoading(false);
      }

      const filter = () =>
        `creator = "${authData()?.id}" ${
          !statusFilter() || statusFilter() !== "all"
            ? `&& status = "${statusFilter()}"`
            : ""
        } ${getTimeFilterString(timeFilter())}`;

      const unsubscribeFunc = pocketBase()
        .collection("smartImports")
        .subscribe(
          "*",
          (e) => {
            const newImport = smartImportFromModel(e.record);
            arrayUpdateSubscriptionCallback(
              newImport,
              e.action,
              setSmartImports,
            );
          },
          {
            filter: pocketBase().filter(filter()),
          },
        );

      setUnsubscribeFunc(unsubscribeFunc);
      return unsubscribeFunc;
    },
  );

  onCleanup(async () => {
    await (
      await unsubscribeFunc()
    )();
  });

  return (
    <>
      <ActionBar>
        <select
          class="mr-3 bg-white"
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All</option>
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
