import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const ApiKeyInput = ({ label, value, onChange, placeholder }: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);

  const getApiKeyUrl = (label: string) => {
    if (label.toLowerCase().includes('letzai')) {
      return 'http://letz.ai/subscription';
    }
    if (label.toLowerCase().includes('openai')) {
      return 'https://platform.openai.com/api-keys';
    }
    return null;
  };

  const apiKeyUrl = getApiKeyUrl(label);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Key className="w-4 h-4" />
          {label}
        </Label>
        {apiKeyUrl && (
          <a
            href={apiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Create key
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          type={showKey ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 bg-secondary/50 border-border focus:bg-background transition-colors"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          onClick={() => setShowKey(!showKey)}
        >
          {showKey ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};