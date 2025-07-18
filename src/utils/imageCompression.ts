export const compressImage = async (
  dataUrl: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      // Only resize if image is larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for better compression (unless it's a PNG with transparency)
      const outputFormat = dataUrl.includes('image/png') && hasTransparency(canvas, ctx) 
        ? 'image/png' 
        : 'image/jpeg';
      
      const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
      
      // Check if compression actually reduced size
      if (compressedDataUrl.length < dataUrl.length) {
        resolve(compressedDataUrl);
      } else {
        resolve(dataUrl); // Return original if compression didn't help
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
};

// Check if image has transparency
const hasTransparency = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Check alpha channel
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  
  return false;
};

// Get size of data URL in bytes
export const getDataUrlSize = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;
  
  // Calculate size: base64 is ~33% larger than binary
  return Math.round(base64.length * 0.75);
};

// Format bytes to human readable
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};