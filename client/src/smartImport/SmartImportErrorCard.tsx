import { Show } from "solid-js";
import { Card } from "../grid/Card";
import { SmartImport } from "../model/model";

export function SmartImportErrorCard({
  smartImport,
}: {
  smartImport: SmartImport;
}) {
  return (
    <Card title={smartImport.id}>
      <Show when={smartImport.url}>
        <p class="text-xs">Url: {smartImport.url}</p>
      </Show>
      <Show when={smartImport.error}>
        <p class="text-xs">Error: {smartImport.error}</p>
      </Show>
    </Card>
  );
}
