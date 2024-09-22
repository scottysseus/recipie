import { For, JSX, Show } from "solid-js";
import { GridSection } from "src/components/grid/GridSection";

export type GridData = { [key: string]: JSX.Element[] };

export function Grid({ sections }: { sections: GridData }) {
  return (
    <Show when={!isEmpty(sections)} fallback={<Placeholder />}>
      <For each={Object.keys(sections)}>
        {(key) =>
          sections[key].length > 0 ? (
            <div class="mb-8">
              <GridSection name={key} cards={sections[key]} />
            </div>
          ) : (
            <></>
          )
        }
      </For>
    </Show>
  );
}

function Placeholder() {
  return (
    <div class="flex flex-col text-center">
      <h1 class="mb-6 text-2xl">You have no recipes</h1>
      <p>Recipes you create will be visible here</p>
    </div>
  );
}

function isEmpty(data: GridData) {
  return !Object.keys(data).some((key) => data[key].length > 0);
}
