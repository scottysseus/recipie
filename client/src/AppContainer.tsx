import { ParentProps } from "solid-js";

export function AppContainer(props: ParentProps) {
  return (
    <>
      <div class="mb-16 flex justify-start">
        <button class="hover:underline">+ New Recipe</button>
      </div>
      {props.children}
    </>
  );
}
