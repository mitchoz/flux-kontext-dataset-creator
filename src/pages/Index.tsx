import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromptInput } from "@/components/PromptInput";
import { ImageUploader } from "@/components/ImageUploader";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AspectRatioSelector, aspectRatioOptions } from "@/components/AspectRatioSelector";
import { ModeSelector, LetzAIMode } from "@/components/ModeSelector";
import { GenerationQueue } from "@/components/GenerationQueue";
import { QueueItemData } from "@/components/QueueItem";
import { LetzAIService } from "@/services/letzai";
import { OpenAIService } from "@/services/openai";
import { Zap, Settings, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [beforePrompt, setBeforePrompt] = useState("");
  const [afterPrompt, setAfterPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [letzaiApiKey, setLetzaiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1024x1024");
  const [mode, setMode] = useState<LetzAIMode>("turbo");
  const [startingNumber, setStartingNumber] = useState(1);
  const [queue, setQueue] = useState<QueueItemData[]>([]);
  
  // Process queue automatically
  useEffect(() => {
    const processItem = async (itemId: string) => {
      const pendingItem = queue.find(item => item.id === itemId && item.status === 'pending');
      if (!pendingItem) return;

      const selectedRatio = aspectRatioOptions.find(option => option.value === pendingItem.aspectRatio);
      if (!selectedRatio) return;

      try {
        let beforeImageUrl: string;

        // Check if this is an uploaded image or needs LetzAI generation
        if (pendingItem.uploadedFile) {
          // Handle uploaded image
          setQueue(prev => prev.map(item => 
            item.id === pendingItem.id 
              ? { ...item, status: 'openai-processing', message: 'Preparing uploaded image...' }
              : item
          ));

          // Convert uploaded file to data URL
          beforeImageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result && typeof e.target.result === 'string') {
                resolve(e.target.result);
              } else {
                reject(new Error('Failed to read file'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(pendingItem.uploadedFile!);
          });

          // Update with before image
          setQueue(prev => prev.map(item => 
            item.id === pendingItem.id 
              ? { 
                  ...item, 
                  status: 'openai-processing',
                  progress: 50,
                  message: 'Processing with OpenAI...',
                  beforeImage: beforeImageUrl
                }
              : item
          ));
        } else {
          // Generate with LetzAI
          setQueue(prev => prev.map(item => 
            item.id === pendingItem.id 
              ? { ...item, status: 'letzai-processing', message: 'Sending request to LetzAI...' }
              : item
          ));

          const letzaiService = new LetzAIService(letzaiApiKey);
          const imageId = await letzaiService.generateImage(
            pendingItem.beforePrompt,
            selectedRatio.width,
            selectedRatio.height,
            pendingItem.mode
          );

          // Poll for completion
          beforeImageUrl = await letzaiService.waitForCompletion(
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
        }

        // Step 2: Process with OpenAI
        const openaiService = new OpenAIService(openaiApiKey);
        const afterImageUrl = await openaiService.editImage(
          beforeImageUrl,
          pendingItem.afterPrompt,
          selectedRatio.width,
          selectedRatio.height,
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

    // Process all pending items simultaneously
    const pendingItems = queue.filter(item => item.status === 'pending');
    pendingItems.forEach(item => {
      // For uploaded images, only OpenAI key is needed
      // For LetzAI generation, both keys are needed
      const canProcess = item.uploadedFile 
        ? openaiApiKey 
        : (letzaiApiKey && openaiApiKey);
        
      if (canProcess) {
        processItem(item.id);
      }
    });
  }, [queue, letzaiApiKey, openaiApiKey]);

  const handleAddToQueue = () => {
    // Check if we have either a prompt or uploaded images for "before"
    const hasBeforePrompt = beforePrompt.trim();
    const hasUploadedImages = uploadedImages.length > 0;
    
    if (!hasBeforePrompt && !hasUploadedImages) {
      toast.error("Please either enter a before prompt or upload images");
      return;
    }

    if (!afterPrompt.trim()) {
      toast.error("Please enter an after prompt for transformation");
      return;
    }

    if (!openaiApiKey.trim()) {
      toast.error("OpenAI API key is required for transformations");
      return;
    }

    // If using LetzAI generation, require LetzAI API key
    if (hasBeforePrompt && !hasUploadedImages && !letzaiApiKey.trim()) {
      toast.error("LetzAI API key is required for image generation");
      return;
    }

    // Add items for uploaded images
    if (hasUploadedImages) {
      uploadedImages.forEach((file, index) => {
        const queueIndex = queue.filter(item => item.status !== 'error').length + index;
        const imageNumber = startingNumber + queueIndex;

        const newItem: QueueItemData = {
          id: crypto.randomUUID(),
          beforePrompt: '', // No prompt needed for uploaded images
          afterPrompt,
          aspectRatio,
          mode,
          imageNumber,
          timestamp: new Date(),
          status: 'pending',
          progress: 0,
          message: 'Waiting in queue...',
          uploadedFile: file // Store the uploaded file
        };

        setQueue(prev => [newItem, ...prev]);
      });
      
      // Clear uploaded images after adding to queue
      setUploadedImages([]);
      toast.success(`Added ${uploadedImages.length} uploaded images to queue!`);
    }

    // Add item for LetzAI generation if prompt is provided
    if (hasBeforePrompt) {
      const queueIndex = queue.filter(item => item.status !== 'error').length + uploadedImages.length;
      const imageNumber = startingNumber + queueIndex;

      const newItem: QueueItemData = {
        id: crypto.randomUUID(),
        beforePrompt,
        afterPrompt,
        aspectRatio,
        mode,
        imageNumber,
        timestamp: new Date(),
        status: 'pending',
        progress: 0,
        message: 'Waiting in queue...'
      };

      setQueue(prev => [newItem, ...prev]);
      toast.success("Added LetzAI generation to queue!");
    }
  };

  const handleRemoveItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from queue");
  };

  const handleDownloadItem = async (id: string) => {
    const item = queue.find(q => q.id === id);
    if (!item || !item.beforeImage || !item.afterImage) return;
    
    try {
      const paddedNumber = item.imageNumber.toString().padStart(4, '0');
      
      // Helper function to convert image to JPEG and download
      const downloadAsJpeg = async (imageUrl: string, filename: string) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Fill with white background for JPEG
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG blob
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.click();
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/jpeg', 0.9);
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });
      };
      
      // Download both images
      await downloadAsJpeg(item.beforeImage, `${paddedNumber}_start.jpg`);
      await downloadAsJpeg(item.afterImage, `${paddedNumber}_end.jpg`);
      
      toast.success(`Downloaded ${paddedNumber}_start.jpg and ${paddedNumber}_end.jpg`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download images");
    }
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
            {/* Before Section: Prompt (1fr) + Upload (1fr) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Before Images</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <PromptInput
                  label="Generate with LetzAI"
                  placeholder="Describe the initial image (e.g., 'A room in a house')"
                  value={beforePrompt}
                  onChange={setBeforePrompt}
                  description="Generate images using LetzAI with this prompt"
                />
                
                <ImageUploader
                  images={uploadedImages}
                  onImagesChange={setUploadedImages}
                />
              </div>
            </div>

            <Separator />

            {/* After Section: Prompt only */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">After Transformation</h3>
              <PromptInput
                label="OpenAI Transformation"
                placeholder="Describe the transformation (e.g., 'Turn this into 3D tiny world')"
                value={afterPrompt}
                onChange={setAfterPrompt}
                description="This will be used to transform the images with OpenAI"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <AspectRatioSelector
                value={aspectRatio}
                onChange={setAspectRatio}
              />
              <ModeSelector
                value={mode}
                onChange={setMode}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Starting Number</label>
                <input
                  type="number"
                  value={startingNumber}
                  onChange={(e) => setStartingNumber(parseInt(e.target.value) || 1)}
                  min="1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Images will be named: {startingNumber.toString().padStart(4, '0')}_start.jpg, {startingNumber.toString().padStart(4, '0')}_end.jpg
                </p>
              </div>
            </div>
            
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
