import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Square, Monitor, Smartphone } from "lucide-react";

export interface AspectRatioOption {
  value: string;
  label: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const aspectRatioOptions: AspectRatioOption[] = [
  {
    value: "1024x1024",
    label: "Square (1:1)",
    width: 1024,
    height: 1024,
    icon: <Square className="w-4 h-4" />
  },
  {
    value: "1536x1024", 
    label: "Landscape (3:2)",
    width: 1536,
    height: 1024,
    icon: <Monitor className="w-4 h-4" />
  },
  {
    value: "1024x1536",
    label: "Portrait (2:3)", 
    width: 1024,
    height: 1536,
    icon: <Smartphone className="w-4 h-4" />
  }
];

export const AspectRatioSelector = ({ value, onChange }: AspectRatioSelectorProps) => {
  const selectedOption = aspectRatioOptions.find(option => option.value === value);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Aspect Ratio</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-secondary/50 border-border focus:bg-background transition-colors">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedOption?.icon}
              {selectedOption?.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {aspectRatioOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {option.width}×{option.height}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Choose the aspect ratio for your generated images. Both images will use the same dimensions.
      </p>
    </div>
  );
};