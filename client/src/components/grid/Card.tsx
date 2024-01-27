import { useNavigate } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

export interface CardProps extends ParentProps {
  title?: string;
  path?: string;
}

export function Card(props: CardProps) {
  const navigate = useNavigate();
  return (
    <button
      class="min-w-72 max-w-xs border border-black p-2 text-start"
      onClick={() => props.path && navigate(props.path)}
    >
      <Show when={props.title}>
        <h1 class="mb-2 text-sm">{props.title}</h1>
      </Show>
      {props.children}
    </button>
  );
}
