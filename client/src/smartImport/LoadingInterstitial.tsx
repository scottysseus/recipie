import { Loader } from "../Loader";

export function LoadingInterstitial() {
  return (
    <div class="p-24 text-center">
      <h1 class="mb-3 text-2xl">Importing recipes</h1>
      <Loader />
    </div>
  );
}
