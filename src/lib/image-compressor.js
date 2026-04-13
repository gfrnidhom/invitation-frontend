/**
 * Compresses an image file directly in the browser to save bandwidth and storage.
 * 
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Target maximum file size in megabytes (default: 2.5)
 * @param {number} options.maxWidthOrHeight - Target maximum width or height in pixels (default: 1920)
 * @param {number} options.initialQuality - Initial JPEG/WEBP quality (default: 0.95)
 * @returns {Promise<File>} - A Promise that resolves to the compressed File object (or original file if not an image)
 */
export async function compressImage(file, { maxSizeMB = 2.5, maxWidthOrHeight = 1920, initialQuality = 0.95 } = {}) {
  return new Promise((resolve, reject) => {
    // Only compress image files, ignore SVGs, GIFs (which canvas flattens), etc.
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return resolve(file);
    }

    // Skip compression if file is already smaller than target size and we don't force resize
    // We still allow it to go through if we want to ensure max dimensions, but to be simple:
    const sizeInMB = file.size / (1024 * 1024);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        } else if (sizeInMB <= maxSizeMB) {
            // It's small enough and dimensions are within bounds, just return original
            return resolve(file);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Handle transparency for PNGs
        if (file.type === 'image/jpeg' || file.type === 'image/webp') {
           ctx.fillStyle = '#ffffff';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let iterations = 0;
        const maxIterations = 5;

        const attemptCompression = () => {
          // Note: format defaults to image/png if we pass a PNG. PNG ignores quality parameter.
          // Fallback to JPEG if it's too large and it's a JPEG or WEBP to apply aggressive compression.
          // For simplicity, we just use the original type.
          let outputType = file.type;
          
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas compression failed'));
            
            const compressedMB = blob.size / (1024 * 1024);
            
            // If it's a format that respects quality (jpeg/webp) and is still too large
            if (compressedMB > maxSizeMB && quality > 0.5 && iterations < maxIterations && (outputType === 'image/jpeg' || outputType === 'image/webp')) {
              quality -= 0.1;
              iterations++;
              attemptCompression();
            } else {
              // Return original file if somehow compression made it much worse (unlikely but possible with PNGs)
              if (blob.size >= file.size && width === img.width && height === img.height) {
                  return resolve(file);
              }

              const newFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(newFile);
            }
          }, outputType, quality);
        };

        attemptCompression();
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
