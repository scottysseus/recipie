import { useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";
import { useAuthContext } from "../../AuthContext";

export function Greeting() {
  const [authData] = useAuthContext()!;
  const navigate = useNavigate();

  createEffect(() => {
    if (authData()) {
      navigate("/app");
    }
  });

  return (
    <div class="p-24 text-center">
      <h1 class="mb-3 text-2xl">Welcome to Recipie</h1>
      <p>Sign in to get started</p>
    </div>
  );
}
