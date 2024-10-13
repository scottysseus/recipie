import { Show } from "solid-js";
import { Card } from "src/components/list/Card";
import { toLocalizedDateTimeString } from "src/lead/util";
import { SmartImport } from "src/model/model";

export function SmartImportCard({
  smartImport,
  path,
}: {
  smartImport: SmartImport;
  path: string;
}) {
  return (
    <Card title={smartImport.id} subtitle={smartImport.status} path={path}>
      <p class="mb-2 text-xs italic">
        From {toLocalizedDateTimeString(smartImport.created)}
      </p>
      <p class="mb-2 text-xs">{smartImport.url}</p>
      <Show
        when={!smartImport.error}
        fallback={<p class="text-xs">Failed to import</p>}
      >
        <p class="text-xs">
          {smartImport.recipes.length} recipe
          {smartImport.recipes.length !== 1 ? "s" : ""}
        </p>
      </Show>
    </Card>
  );
}
