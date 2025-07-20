import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type LetzAIMode = "turbo" | "sigma" | "default";

export const modeOptions = [
  { value: "turbo" as LetzAIMode, label: "Turbo", description: "Fastest generation, lower quality" },
  { value: "sigma" as LetzAIMode, label: "Sigma", description: "Faster, great for close-ups" },
  { value: "default" as LetzAIMode, label: "Default", description: "Slow but high quality" }
];

interface ModeSelectorProps {
  value: LetzAIMode;
  onChange: (mode: LetzAIMode) => void;
}

export const ModeSelector = ({ value, onChange }: ModeSelectorProps) => {
  const selectedMode = modeOptions.find(option => option.value === value);

  return (
    <div className="space-y-2">
      <Label>Generation Mode</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select generation mode" />
        </SelectTrigger>
        <SelectContent>
          {modeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedMode && (
        <p className="text-xs text-muted-foreground">
          {selectedMode.description}
        </p>
      )}
    </div>
  );
};