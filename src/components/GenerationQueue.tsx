import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueItem, QueueItemData } from "@/components/QueueItem";
import { Download, Trash2, RotateCcw } from "lucide-react";

interface GenerationQueueProps {
  queue: QueueItemData[];
  onRemoveItem: (id: string) => void;
  onDownloadItem: (id: string) => void;
  onClearCompleted: () => void;
  onExportAll: () => void;
}

export const GenerationQueue = ({ 
  queue, 
  onRemoveItem, 
  onDownloadItem,
  onClearCompleted,
  onExportAll 
}: GenerationQueueProps) => {
  const completedItems = queue.filter(item => item.status === 'completed');
  const processingItems = queue.filter(item => 
    item.status === 'letzai-processing' || item.status === 'openai-processing'
  );
  const pendingItems = queue.filter(item => item.status === 'pending');
  const errorItems = queue.filter(item => item.status === 'error');

  if (queue.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No items in queue</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add prompts above to start generating image pairs
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Generation Queue</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{processingItems.length} processing</span>
            <span>{pendingItems.length} pending</span>
            <span>{completedItems.length} completed</span>
            {errorItems.length > 0 && (
              <span className="text-destructive">{errorItems.length} failed</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {completedItems.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportAll}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All ({completedItems.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Completed
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {/* Processing Items First */}
        {processingItems.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onDownload={onDownloadItem}
          />
        ))}
        
        {/* Pending Items */}
        {pendingItems.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onDownload={onDownloadItem}
          />
        ))}
        
        {/* Completed Items */}
        {completedItems.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onDownload={onDownloadItem}
          />
        ))}
        
        {/* Error Items */}
        {errorItems.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onDownload={onDownloadItem}
          />
        ))}
      </div>
    </div>
  );
};