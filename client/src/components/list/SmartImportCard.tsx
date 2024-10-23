import { Show } from "solid-js";
import { Card } from "src/components/list/Card";
import { toLocalizedDateTimeString } from "src/lead/util";
import { SmartImport } from "src/model/model";

export function SmartImportCard(props: {
  smartImport: SmartImport;
  path: string;
}) {
  return (
    <Card
      title={props.smartImport.id}
      subtitle={props.smartImport.status}
      path={props.path}
    >
      <p class="mb-2 text-xs italic">
        From {toLocalizedDateTimeString(props.smartImport.created)}
      </p>
      <p class="mb-2 text-xs">{props.smartImport.url}</p>
      <Show
        when={!props.smartImport.error}
        fallback={<p class="text-xs">Failed to import</p>}
      >
        <p class="text-xs">
          {props.smartImport.recipes.length} recipe
          {props.smartImport.recipes.length !== 1 ? "s" : ""}
        </p>
      </Show>
    </Card>
  );
}
