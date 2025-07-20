import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromptInput } from "@/components/PromptInput";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AspectRatioSelector, aspectRatioOptions } from "@/components/AspectRatioSelector";
import { GenerationQueue } from "@/components/GenerationQueue";
import { QueueItemData } from "@/components/QueueItem";
import { LetzAIService } from "@/services/letzai";
import { OpenAIService } from "@/services/openai";
import { Zap, Settings, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [beforePrompt, setBeforePrompt] = useState("");
  const [afterPrompt, setAfterPrompt] = useState("");
  const [letzaiApiKey, setLetzaiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1024x1024");
  const [queue, setQueue] = useState<QueueItemData[]>([]);
  
  // Process queue automatically
  useEffect(() => {
    const processNextItem = async () => {
      const pendingItem = queue.find(item => item.status === 'pending');
      if (!pendingItem || !letzaiApiKey || !openaiApiKey) return;

      const selectedRatio = aspectRatioOptions.find(option => option.value === pendingItem.aspectRatio);
      if (!selectedRatio) return;

      try {
        // Update to processing status
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { ...item, status: 'letzai-processing', message: 'Sending request to LetzAI...' }
            : item
        ));

        // Step 1: Generate with LetzAI
        const letzaiService = new LetzAIService(letzaiApiKey);
        const imageId = await letzaiService.generateImage(
          pendingItem.beforePrompt,
          selectedRatio.width,
          selectedRatio.height
        );

        // Poll for completion
        const beforeImageUrl = await letzaiService.waitForCompletion(
          imageId,
          (progress, message) => {
            setQueue(prev => prev.map(item => 
              item.id === pendingItem.id 
                ? { ...item, progress, message }
                : item
            ));
          }
        );

        // Update with before image and start OpenAI processing
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { 
                ...item, 
                status: 'openai-processing',
                progress: 0,
                message: 'Preparing image for OpenAI...',
                beforeImage: beforeImageUrl
              }
            : item
        ));

        // Step 2: Process with OpenAI
        const openaiService = new OpenAIService(openaiApiKey);
        const afterImageUrl = await openaiService.editImage(
          beforeImageUrl,
          pendingItem.afterPrompt,
          (message) => {
            setQueue(prev => prev.map(item => 
              item.id === pendingItem.id 
                ? { ...item, message }
                : item
            ));
          }
        );

        // Mark as completed
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { 
                ...item, 
                status: 'completed',
                progress: 100,
                message: 'Transformation complete!',
                afterImage: afterImageUrl
              }
            : item
        ));

        toast.success("Image pair generated successfully!");

      } catch (error) {
        console.error('Generation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { 
                ...item, 
                status: 'error',
                error: errorMessage,
                message: `Failed: ${errorMessage}`
              }
            : item
        ));

        toast.error(`Generation failed: ${errorMessage}`);
      }
    };

    // Check if we can process next item (only one at a time for now)
    const isProcessing = queue.some(item => 
      item.status === 'letzai-processing' || item.status === 'openai-processing'
    );
    
    if (!isProcessing) {
      processNextItem();
    }
  }, [queue, letzaiApiKey, openaiApiKey]);

  const handleAddToQueue = () => {
    if (!beforePrompt.trim() || !afterPrompt.trim()) {
      toast.error("Please enter both before and after prompts");
      return;
    }

    if (!letzaiApiKey.trim() || !openaiApiKey.trim()) {
      toast.error("Please enter both API keys");
      return;
    }

    const newItem: QueueItemData = {
      id: crypto.randomUUID(),
      beforePrompt,
      afterPrompt,
      aspectRatio,
      timestamp: new Date(),
      status: 'pending',
      progress: 0,
      message: 'Waiting in queue...'
    };

    setQueue(prev => [...prev, newItem]);
    
    // Clear prompts for next entry
    setBeforePrompt("");
    setAfterPrompt("");
    
    toast.success("Added to generation queue!");
  };

  const handleRemoveItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from queue");
  };

  const handleDownloadItem = (id: string) => {
    const item = queue.find(q => q.id === id);
    if (!item || !item.beforeImage || !item.afterImage) return;
    
    // TODO: Implement download functionality
    toast.success("Download functionality coming soon!");
  };

  const handleClearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
    toast.success("Cleared completed items");
  };

  const handleExportAll = () => {
    const completedItems = queue.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      toast.error("No completed items to export");
      return;
    }
    
    // TODO: Implement actual export functionality
    toast.success(`Exporting ${completedItems.length} pairs...`);
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
            <Plus className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Add to Generation Queue</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>
            
            <AspectRatioSelector
              value={aspectRatio}
              onChange={setAspectRatio}
            />
            
            <Separator />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddToQueue}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Queue
              </Button>
            </div>
          </div>
        </Card>

        {/* Generation Queue */}
        <GenerationQueue
          queue={queue}
          onRemoveItem={handleRemoveItem}
          onDownloadItem={handleDownloadItem}
          onClearCompleted={handleClearCompleted}
          onExportAll={handleExportAll}
        />
      </div>
    </div>
  );
};

export default Index;
