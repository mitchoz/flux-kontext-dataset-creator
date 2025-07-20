import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";

interface GenerationStep {
  id: 'letzai' | 'openai';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: string;
}

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: GenerationStep[];
}

export const GenerationModal = ({ isOpen, onClose, steps }: GenerationModalProps) => {
  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isGenerationComplete = steps.every(step => step.status === 'completed');
  const hasError = steps.some(step => step.status === 'error');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse" />
            Generating Image Pair
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="space-y-3">
              <div className="flex items-center gap-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {step.status === 'in-progress' && (
                <div className="space-y-2 ml-8">
                  <Progress value={step.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{step.message}</p>
                </div>
              )}

              {step.status === 'error' && (
                <div className="ml-8 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{step.message}</p>
                </div>
              )}

              {step.result && step.status === 'completed' && (
                <div className="ml-8">
                  <img 
                    src={step.result} 
                    alt={step.title}
                    className="w-full max-w-md h-48 object-cover rounded-md border"
                  />
                </div>
              )}

              {index < steps.length - 1 && (
                <div className="ml-2.5 w-0.5 h-4 bg-border" />
              )}
            </div>
          ))}

          {/* Results Preview */}
          {isGenerationComplete && (
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Generated Pair</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map((step) => step.result && (
                  <div key={step.id}>
                    <p className="text-sm text-muted-foreground mb-2">{step.title}</p>
                    <img 
                      src={step.result} 
                      alt={step.title}
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            {hasError && (
              <p className="text-sm text-destructive">
                Generation failed. Please check your API keys and try again.
              </p>
            )}
            {isGenerationComplete && !hasError && (
              <p className="text-sm text-green-600">
                Image pair generated successfully! 
              </p>
            )}
            {!isGenerationComplete && !hasError && (
              <p className="text-sm text-muted-foreground">
                Please wait while we generate your image pair...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};