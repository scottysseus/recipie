import { ParentProps } from "solid-js";

export function ActionBar(props: ParentProps) {
  return <div class="mb-16 flex justify-start">{props.children}</div>;
}
