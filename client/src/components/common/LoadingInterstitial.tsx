import { Loader } from "src/components/common/Loader";

export function LoadingInterstitial() {
  return (
    <div class="p-24 text-center">
      <h1 class="mb-3 text-2xl">Loading</h1>
      <Loader />
    </div>
  );
}
