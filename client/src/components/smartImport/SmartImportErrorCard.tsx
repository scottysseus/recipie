import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { Card } from "src/components/grid/Card";
import { SmartImport } from "src/model/model";

export function SmartImportErrorCard({
  smartImport,
}: {
  smartImport: SmartImport;
}) {
  const params = useParams();
  return (
    <Card
      title={smartImport.id}
      path={`/app/bulkSmartImports/${params.id}/smartImports/${smartImport.id}`}
    >
      <Show when={smartImport.url}>
        <p class="text-xs">Url: {smartImport.url}</p>
      </Show>
      <p class="mt-3 text-xs">X Recipe import failed</p>
    </Card>
  );
}
