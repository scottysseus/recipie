import { Show } from "solid-js";
import { Card } from "../grid/Card";
import { toLocalizedDateTimeString } from "../lead/util";
import { BulkSmartImport } from "../model/model";

export function BulkSmartImportCard({
  bulkSmartImport,
}: {
  bulkSmartImport: BulkSmartImport;
}) {
  return (
    <Card
      title={bulkSmartImport.id}
      path={`/app/bulkSmartImports/${bulkSmartImport.id}`}
    >
      <p class="text-xs">{bulkSmartImport.imports.length || "???"} recipes</p>
      <Show when={bulkSmartImport.created}>
        <p class="mt-2 text-xs text-gray-400">
          {toLocalizedDateTimeString(bulkSmartImport.created)}
        </p>
      </Show>
    </Card>
  );
}
