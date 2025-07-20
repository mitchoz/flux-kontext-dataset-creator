import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export const PromptInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  description 
}: PromptInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none border-border bg-secondary/50 focus:bg-background transition-colors"
      />
    </div>
  );
};