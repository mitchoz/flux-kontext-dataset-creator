import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, X, Download } from "lucide-react";

export interface QueueItemData {
  id: string;
  beforePrompt: string;
  afterPrompt: string;
  aspectRatio: string;
  mode: string;
  imageNumber: number;
  timestamp: Date;
  status: 'pending' | 'letzai-processing' | 'openai-processing' | 'completed' | 'error';
  progress: number;
  message: string;
  beforeImage?: string;
  afterImage?: string;
  error?: string;
}

interface QueueItemProps {
  item: QueueItemData;
  onRemove: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const QueueItem = ({ item, onRemove, onDownload }: QueueItemProps) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'letzai-processing':
      case 'openai-processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'pending':
        return 'Waiting in queue...';
      case 'letzai-processing':
        return 'Generating initial image...';
      case 'openai-processing':
        return 'Transforming with AI...';
      case 'completed':
        return 'Generated successfully!';
      case 'error':
        return `Error: ${item.error || 'Unknown error'}`;
      default:
        return 'Unknown status';
    }
  };

  const isProcessing = item.status === 'letzai-processing' || item.status === 'openai-processing';

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                #{item.imageNumber.toString().padStart(4, '0')} • {item.aspectRatio}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={item.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{item.message}</p>
            </div>
          )}

          {/* Error */}
          {item.status === 'error' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{item.error}</p>
            </div>
          )}

          {/* Prompts */}
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Before:</span> {item.beforePrompt}</p>
            <p><span className="text-muted-foreground">After:</span> {item.afterPrompt}</p>
          </div>

          {/* Results */}
          {(item.beforeImage || item.afterImage) && (
            <div className="grid grid-cols-2 gap-4">
              {item.beforeImage && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Before (LetzAI)</p>
                  <div className="w-full rounded-md border overflow-hidden">
                    <img 
                      src={item.beforeImage} 
                      alt="Before" 
                      className="w-full h-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(item.beforeImage, '_blank')}
                    />
                  </div>
                </div>
              )}
              {item.afterImage && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">After (OpenAI)</p>
                  <div className="w-full rounded-md border overflow-hidden">
                    <img 
                      src={item.afterImage} 
                      alt="After" 
                      className="w-full h-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (item.afterImage.startsWith('data:')) {
                          // For data URLs, create a blob and open it
                          const byteCharacters = atob(item.afterImage.split(',')[1]);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: 'image/jpeg' });
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        } else {
                          window.open(item.afterImage, '_blank');
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download button */}
          {item.status === 'completed' && onDownload && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(item.id)}
                className="flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                Download Pair
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {item.timestamp.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};