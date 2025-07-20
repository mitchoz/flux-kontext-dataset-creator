import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";

export interface GeneratedPair {
  id: string;
  beforePrompt: string;
  afterPrompt: string;
  beforeImage?: string;
  afterImage?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
}

interface GenerationHistoryProps {
  history: GeneratedPair[];
  onDelete: (id: string) => void;
  onExport: () => void;
}

export const GenerationHistory = ({ history, onDelete, onExport }: GenerationHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No image pairs generated yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first dataset pair using the form above
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Pairs ({history.length})</h3>
        <Button 
          onClick={onExport} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Dataset
        </Button>
      </div>
      
      <div className="grid gap-4">
        {history.map((pair) => (
          <Card key={pair.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  {pair.beforeImage && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Before</p>
                      <img 
                        src={pair.beforeImage} 
                        alt="Before" 
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  {pair.afterImage && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">After</p>
                      <img 
                        src={pair.afterImage} 
                        alt="After" 
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Before:</span> {pair.beforePrompt}</p>
                  <p><span className="text-muted-foreground">After:</span> {pair.afterPrompt}</p>
                  <p className="text-xs text-muted-foreground">
                    {pair.timestamp.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    pair.status === 'completed' ? 'bg-green-500' :
                    pair.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {pair.status}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(pair.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};