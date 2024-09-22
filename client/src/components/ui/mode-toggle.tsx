import { Moon, Sun } from "lucide-solid";
import { ToggleGroup, ToggleGroupItem } from "src/components/ui/toggle-group";

export function ModeToggle() {
  return (
    <ToggleGroup>
      <ToggleGroupItem value="dark">
        <Moon class="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="light">
        <Sun class="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
