/** Downscale and JPEG-encode images before sending to the API (smaller payload, faster Ollama vision). */

const MAX_EDGE_PX = 1536;
const JPEG_QUALITY = 0.82;

function baseName(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

/**
 * Loads a data URL, scales so the longest side is at most MAX_EDGE_PX, re-encodes as JPEG.
 */
export async function optimizeChatImageFromDataUrl(
  dataUrl: string,
  originalFileName: string
): Promise<{ dataUrl: string; size: number; mimeType: string; name: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w < 1 || h < 1) {
        reject(new Error('Invalid image dimensions'));
        return;
      }

      const max = MAX_EDGE_PX;
      if (w > max || h > max) {
        const scale = Math.min(max / w, max / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not create canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not encode image'));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              size: blob.size,
              mimeType: 'image/jpeg',
              name: `${baseName(originalFileName)}.jpg`
            });
          };
          reader.onerror = () => reject(new Error('Could not read encoded image'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = dataUrl;
  });
}
