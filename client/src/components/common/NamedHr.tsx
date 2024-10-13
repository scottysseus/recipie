export function NamedHr({ name }: { name: string }) {
  return (
    <div class="mb-4 flex items-center justify-start">
      <p class="mr-8 whitespace-nowrap text-nowrap">{name}</p>
      <hr class="w-full border-black" color="black"></hr>
    </div>
  );
}
