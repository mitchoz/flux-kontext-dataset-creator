import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromptInput } from "@/components/PromptInput";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { GenerationHistory, GeneratedPair } from "@/components/GenerationHistory";
import { Zap, Download, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [beforePrompt, setBeforePrompt] = useState("");
  const [afterPrompt, setAfterPrompt] = useState("");
  const [letzaiApiKey, setLetzaiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedPair[]>([]);

  const handleGenerate = async () => {
    if (!beforePrompt.trim() || !afterPrompt.trim()) {
      toast.error("Please enter both before and after prompts");
      return;
    }

    if (!letzaiApiKey.trim() || !openaiApiKey.trim()) {
      toast.error("Please enter both API keys");
      return;
    }

    setIsGenerating(true);
    
    // Create new pair entry
    const newPair: GeneratedPair = {
      id: crypto.randomUUID(),
      beforePrompt,
      afterPrompt,
      timestamp: new Date(),
      status: 'pending'
    };

    setHistory(prev => [newPair, ...prev]);
    
    // Simulate API calls for now
    setTimeout(() => {
      setHistory(prev => prev.map(pair => 
        pair.id === newPair.id 
          ? { ...pair, status: 'completed' as const }
          : pair
      ));
      setIsGenerating(false);
      toast.success("Image pair generated successfully!");
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(pair => pair.id !== id));
    toast.success("Pair deleted");
  };

  const handleExport = () => {
    const completedPairs = history.filter(pair => pair.status === 'completed');
    if (completedPairs.length === 0) {
      toast.error("No completed pairs to export");
      return;
    }
    
    // TODO: Implement actual export functionality
    toast.success(`Exporting ${completedPairs.length} pairs...`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Flux Kontext Dataset Generator</h1>
              <p className="text-white/80 text-sm">Create image pairs for AI training datasets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* API Configuration */}
        <Card className="p-6 mb-8 bg-gradient-secondary border-border">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">API Configuration</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <ApiKeyInput
              label="LetzAI API Key"
              value={letzaiApiKey}
              onChange={setLetzaiApiKey}
              placeholder="Enter your LetzAI API key"
            />
            <ApiKeyInput
              label="OpenAI API Key"
              value={openaiApiKey}
              onChange={setOpenaiApiKey}
              placeholder="Enter your OpenAI API key"
            />
          </div>
        </Card>

        {/* Generation Form */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Generate Image Pair</h2>
          </div>
          
          <div className="space-y-6">
            <PromptInput
              label="Before Prompt"
              placeholder="Describe the initial image (e.g., 'A room in a house')"
              value={beforePrompt}
              onChange={setBeforePrompt}
              description="This will be used to generate the first image using LetzAI"
            />
            
            <PromptInput
              label="After Prompt"
              placeholder="Describe the transformation (e.g., 'Turn this into 3D tiny world')"
              value={afterPrompt}
              onChange={setAfterPrompt}
              description="This will be used to process the first image with OpenAI"
            />
            
            <Separator />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Pair
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* History */}
        <GenerationHistory
          history={history}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Index;
