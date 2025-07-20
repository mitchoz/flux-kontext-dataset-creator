export interface LetzAIResponse {
  id: string;
  imageVersions?: {
    original?: string;
    [key: string]: string | undefined;
  };
  status: 'new' | 'in progress' | 'ready' | 'failed';
  progress: number;
  progressMessage: string;
  prompt: string;
  createdAt: string;
}

export class LetzAIService {
  private apiKey: string;
  private baseUrl = 'https://api.letz.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string, width: number = 1024, height: number = 1024): Promise<string> {
    const response = await fetch(`${this.baseUrl}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        quality: 3,
        creativity: 2,
        hasWatermark: false,
        systemVersion: 3,
        mode: 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`LetzAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  async getImageStatus(imageId: string): Promise<LetzAIResponse> {
    const response = await fetch(`${this.baseUrl}/images/${imageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`LetzAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async waitForCompletion(imageId: string, onProgress?: (progress: number, message: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await this.getImageStatus(imageId);
          
          if (onProgress) {
            onProgress(status.progress, status.progressMessage || 'Generating image...');
          }

          if (status.status === 'ready' && status.imageVersions?.original) {
            clearInterval(pollInterval);
            resolve(status.imageVersions.original);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error('Image generation failed'));
          }
          // Continue polling if status is 'new' or 'in progress'
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Image generation timeout'));
      }, 300000);
    });
  }
}