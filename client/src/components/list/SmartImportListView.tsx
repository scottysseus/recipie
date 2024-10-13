import { For, Show } from "solid-js";
import { NamedHr } from "src/components/common/NamedHr";
import { SmartImportCard } from "src/components/list/SmartImportCard";
import { SmartImport } from "src/model/model";

export function SmartImportListView({
  smartImports,
}: {
  smartImports: SmartImport[];
}) {
  return (
    <>
      <NamedHr name="Smart Imports" />
      <Show when={smartImports.length > 0} fallback={Placeholder()}>
        <div class="flex flex-col">
          <For each={smartImports}>
            {(smartImport) => (
              <div class="mb-3">
                <SmartImportCard
                  smartImport={smartImport}
                  path={`/app/smartImports/${smartImport.id}`}
                />
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

function Placeholder() {
  return (
    <div class="flex flex-col text-center">
      <h1 class="mb-3">Nothing to show</h1>
      <p>Your smart import history will be visible here</p>
    </div>
  );
}
