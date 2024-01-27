import { Show } from "solid-js";
import { BulkSmartImport } from "../model/recipe";
import { Card } from "./Card";

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
        <p class="mt-2 text-xs text-gray-400">{bulkSmartImport.created}</p>
      </Show>
    </Card>
  );
}
