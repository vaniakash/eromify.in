/**
 * Applies Sobel Edge Detection to an ImageData buffer.
 * It uses a luminosity grayscale conversion inline and applies a fast 3x3 convolution block.
 * Returns a binary Uint8Array representing 0 (no edge) and 1 (edge).
 */
export function computeEdgeMap(
  imageData: ImageData,
  edgeSensitivity: number // 0 to 100 range from UI. Lower sensitivity = higher threshold needed to trigger edge.
): Uint8Array {
  const { width, height, data } = imageData;
  
  // Map UI 0-100 to an actual pixel magnitude threshold
  // Sobel magnitudes can mathematically reach ~1442.
  // 100 sensitivity -> very low threshold (picks up all noise, e.g. 5)
  // 1 sensitivity -> very high threshold (only harsh edges, e.g. 990)
  const threshold = Math.max(5, 1000 - (edgeSensitivity * 10));

  // Step 1: Grayscale map
  const grayscale = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // standard perceptual luminance
    grayscale[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Step 2: Sobel Operator
  const edges = new Uint8Array(width * height);
  
  // Flattened 3x3 Sobel kernels
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = grayscale[(y + ky) * width + (x + kx)];
          const weightIdx = (ky + 1) * 3 + (kx + 1);
          sumX += pixel * gx[weightIdx];
          sumY += pixel * gy[weightIdx];
        }
      }

      // Compute gradient magnitude
      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      
      // Evaluate threshold
      edges[y * width + x] = magnitude >= threshold ? 1 : 0;
    }
  }

  return edges;
}
