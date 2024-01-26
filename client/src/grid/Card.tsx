import { ParentProps, Show } from "solid-js";

export interface CardProps extends ParentProps {
  title?: string;
}

export function Card(props: CardProps) {
  return (
    <div class="max-w-xs border border-black p-2">
      <Show when={props.title}>
        <h1 class="mb-2 text-sm">{props.title}</h1>
      </Show>
      {props.children}
    </div>
  );
}
