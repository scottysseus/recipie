import PocketBase from "pocketbase";
import {
  Accessor,
  ParentProps,
  createContext,
  createSignal,
  useContext,
} from "solid-js";

const pb = new PocketBase("http://localhost:8090");

const PocketBaseContext = createContext<Accessor<PocketBase>>();

export function PocketBaseContextProvider(props: ParentProps) {
  const [pocketBase, setPocketBase] = createSignal<PocketBase>(pb);

  setPocketBase(pb);

  return (
    <PocketBaseContext.Provider value={pocketBase}>
      {props.children}
    </PocketBaseContext.Provider>
  );
}

export function usePocketBaseContext() {
  return useContext(PocketBaseContext);
}
