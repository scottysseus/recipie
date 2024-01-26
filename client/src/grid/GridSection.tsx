import { For, JSX } from "solid-js";

export function GridSection({
  name,
  cards,
}: {
  name: string;
  cards: JSX.Element[];
}) {
  return (
    <>
      <div class="mb-4 flex items-center justify-start">
        <p class="mr-8">{name}</p>
        <hr class="w-full border-black" color="black"></hr>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <For each={cards}>{(card) => <div class="mb-2">{card}</div>}</For>
      </div>
    </>
  );
}
