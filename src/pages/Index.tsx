import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromptInput } from "@/components/PromptInput";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { GenerationHistory, GeneratedPair } from "@/components/GenerationHistory";
import { GenerationModal } from "@/components/GenerationModal";
import { LetzAIService } from "@/services/letzai";
import { OpenAIService } from "@/services/openai";
import { Zap, Download, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface GenerationStep {
  id: 'letzai' | 'openai';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: string;
}

const Index = () => {
  const [beforePrompt, setBeforePrompt] = useState("");
  const [afterPrompt, setAfterPrompt] = useState("");
  const [letzaiApiKey, setLetzaiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedPair[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);

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
    setShowModal(true);
    
    // Initialize steps
    const initialSteps: GenerationStep[] = [
      {
        id: 'letzai',
        title: 'Generate Initial Image',
        description: 'Creating image with LetzAI based on your "before" prompt',
        status: 'pending',
        progress: 0,
        message: 'Initializing...'
      },
      {
        id: 'openai',
        title: 'Transform Image',
        description: 'Processing image with OpenAI based on your "after" prompt',
        status: 'pending',
        progress: 0,
        message: 'Waiting for initial image...'
      }
    ];
    
    setGenerationSteps(initialSteps);

    // Create new pair entry
    const newPair: GeneratedPair = {
      id: crypto.randomUUID(),
      beforePrompt,
      afterPrompt,
      timestamp: new Date(),
      status: 'pending'
    };

    setHistory(prev => [newPair, ...prev]);

    try {
      // Step 1: Generate with LetzAI
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'letzai' 
          ? { ...step, status: 'in-progress', message: 'Sending request to LetzAI...' }
          : step
      ));

      const letzaiService = new LetzAIService(letzaiApiKey);
      const imageId = await letzaiService.generateImage(beforePrompt);

      // Poll for completion
      const beforeImageUrl = await letzaiService.waitForCompletion(
        imageId,
        (progress, message) => {
          setGenerationSteps(prev => prev.map(step => 
            step.id === 'letzai' 
              ? { ...step, progress, message }
              : step
          ));
        }
      );

      setGenerationSteps(prev => prev.map(step => 
        step.id === 'letzai' 
          ? { ...step, status: 'completed', progress: 100, result: beforeImageUrl, message: 'Image generated successfully!' }
          : step
      ));

      // Step 2: Process with OpenAI
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'openai' 
          ? { ...step, status: 'in-progress', message: 'Preparing image for OpenAI...' }
          : step
      ));

      const openaiService = new OpenAIService(openaiApiKey);
      const afterImageUrl = await openaiService.editImage(
        beforeImageUrl,
        afterPrompt,
        (message) => {
          setGenerationSteps(prev => prev.map(step => 
            step.id === 'openai' 
              ? { ...step, message }
              : step
          ));
        }
      );

      setGenerationSteps(prev => prev.map(step => 
        step.id === 'openai' 
          ? { ...step, status: 'completed', progress: 100, result: afterImageUrl, message: 'Transformation complete!' }
          : step
      ));

      // Update history with completed pair
      setHistory(prev => prev.map(pair => 
        pair.id === newPair.id 
          ? { 
              ...pair, 
              status: 'completed' as const,
              beforeImage: beforeImageUrl,
              afterImage: afterImageUrl
            }
          : pair
      ));

      toast.success("Image pair generated successfully!");

    } catch (error) {
      console.error('Generation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setGenerationSteps(prev => prev.map(step => {
        if (step.status === 'in-progress') {
          return { ...step, status: 'error', message: errorMessage };
        }
        return step;
      }));

      setHistory(prev => prev.map(pair => 
        pair.id === newPair.id 
          ? { ...pair, status: 'error' as const }
          : pair
      ));

      toast.error(`Generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
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
        
        {/* Generation Modal */}
        <GenerationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          steps={generationSteps}
        />
      </div>
    </div>
  );
};

export default Index;
