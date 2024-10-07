import { Show } from "solid-js";
import { Card } from "src/components/grid/Card";
import { toLocalizedDateTimeString } from "src/lead/util";
import { BulkSmartImport } from "src/model/model";

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
        <p class="mt-2 text-xs text-gray-600">
          {toLocalizedDateTimeString(bulkSmartImport.created)}
        </p>
      </Show>
    </Card>
  );
}
