import { AuthModel } from "pocketbase";
import {
  Accessor,
  ParentProps,
  Setter,
  createContext,
  createSignal,
  useContext,
} from "solid-js";
import { usePocketBaseContext } from "./PocketBaseContext";

const AuthContext =
  createContext<
    [Accessor<AuthModel | undefined>, Setter<AuthModel | undefined>, () => void]
  >();

export function AuthContextProvider(props: ParentProps) {
  const [authData, setAuthData] = createSignal<AuthModel | undefined>(
    undefined,
  );

  const pocketBase = usePocketBaseContext()!;

  const signOut = () => {
    const pb = pocketBase();
    if (pb) {
      pb.authStore.clear();
      setAuthData(undefined);
    }
  };

  return (
    <AuthContext.Provider value={[authData, setAuthData, signOut]}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
