import { ParentProps } from "solid-js";

export function ActionBar(props: ParentProps) {
  return <div class="mb-10 flex justify-start">{props.children}</div>;
}
