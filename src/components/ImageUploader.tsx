import { useCallback, useState, useEffect } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { processImage, createProcessedFile } from '@/utils/imageProcessing';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
  images: File[];
  aspectRatio: string;
}

export const ImageUploader = ({ onImagesChange, images, aspectRatio }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process images when aspect ratio changes
  useEffect(() => {
    if (images.length > 0) {
      processExistingImages();
    }
  }, [aspectRatio]);

  const getDimensions = (ratio: string) => {
    const [width, height] = ratio.split('x').map(Number);
    return { width, height };
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return [];
    
    setIsProcessing(true);
    const dimensions = getDimensions(aspectRatio);
    const processedFiles: File[] = [];

    try {
      for (const file of files) {
        toast(`Processing ${file.name}...`, { duration: 1000 });
        const processedBlob = await processImage(file, dimensions);
        const processedFile = createProcessedFile(processedBlob, file.name);
        processedFiles.push(processedFile);
      }
      toast.success(`Successfully processed ${files.length} image${files.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    } finally {
      setIsProcessing(false);
    }

    return processedFiles;
  };

  const processExistingImages = async () => {
    if (images.length === 0) return;
    const processedFiles = await processFiles(images);
    onImagesChange(processedFiles);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const processedFiles = await processFiles(files);
      onImagesChange([...images, ...processedFiles]);
    }
  }, [images, onImagesChange, aspectRatio]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const processedFiles = await processFiles(files);
      onImagesChange([...images, ...processedFiles]);
    }
  }, [images, onImagesChange, aspectRatio]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-3 h-full max-h-[300px] flex flex-col">
      <div className="flex-shrink-0">
        <Label className="text-sm font-medium">Upload Images</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Upload images to use as the "before" images instead of generating them
        </p>
        <p className="text-xs text-muted-foreground font-medium">
          Images will be cropped and resized to {aspectRatio}
        </p>
      </div>
      
      {/* Drop Zone - Shrinks when images are present */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors flex-shrink-0 ${
          images.length > 0 ? 'h-20 p-3' : 'min-h-[120px] p-6'
        } ${
          isDragging 
            ? 'border-primary bg-secondary/50' 
            : 'border-border bg-secondary/20 hover:bg-secondary/30'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center text-center h-full">
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-sm font-medium">Processing images...</p>
            </>
          ) : (
            <>
              <Upload className={`text-muted-foreground mb-1 ${images.length > 0 ? 'w-4 h-4' : 'w-8 h-8 mb-2'}`} />
              <p className={`font-medium ${images.length > 0 ? 'text-xs' : 'text-sm'}`}>
                {images.length > 0 ? 'Add more' : 'Drop images here or click to browse'}
              </p>
              {images.length === 0 && (
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Preview - Takes remaining space with proper scrolling */}
      {images.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>{images.length} image{images.length !== 1 ? 's' : ''} selected</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onImagesChange([])}
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 border border-border rounded-md p-2">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-secondary rounded-md overflow-hidden border">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};