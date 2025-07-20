export interface ProcessImageOptions {
  width: number;
  height: number;
  quality?: number;
}

export const processImage = (file: File, options: ProcessImageOptions): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const { width: targetWidth, height: targetHeight, quality = 0.9 } = options;
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas to target dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate crop dimensions to maintain aspect ratio
        const sourceAspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (sourceAspectRatio > targetAspectRatio) {
          // Image is wider than target - crop sides
          sourceWidth = img.height * targetAspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (sourceAspectRatio < targetAspectRatio) {
          // Image is taller than target - crop top/bottom
          sourceHeight = img.width / targetAspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Draw the cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const createProcessedFile = (blob: Blob, originalName: string): File => {
  const extension = originalName.split('.').pop() || 'jpg';
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  const processedName = `${nameWithoutExtension}_processed.${extension}`;
  
  return new File([blob], processedName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
};