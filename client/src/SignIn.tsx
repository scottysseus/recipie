import { Navigator, useNavigate } from "@solidjs/router";
import PocketBase, { AuthModel } from "pocketbase";
import { Setter } from "solid-js";
import { useAuthContext } from "./AuthContext";
import { usePocketBaseContext } from "./PocketBaseContext";

export function SignIn() {
  const [, setAuthData] = useAuthContext()!;
  const pocketBase = usePocketBaseContext()!;
  const navigate = useNavigate();

  return (
    <div class="flex justify-center">
      <div class="flex flex-col justify-center text-center">
        <h1 class="mb-6">Welcome</h1>
        <button
          class="text-xs hover:underline"
          onClick={() => signInGoogle(pocketBase(), setAuthData, navigate)}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

async function signInGoogle(
  pocketBase: PocketBase | undefined,
  setAuthData: Setter<AuthModel | undefined>,
  navigate: Navigator,
) {
  if (pocketBase) {
    const authData = await pocketBase
      .collection("users")
      .authWithOAuth2({ provider: "google" });
    setAuthData(authData.record);
    navigate("/");
  }
}
