// Lighthouse.storage API
// Note: lighthouse-sdk package may vary. This uses the REST API directly.
const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

if (!LIGHTHOUSE_API_KEY) {
  console.warn("LIGHTHOUSE_API_KEY not set. Image uploads will fail.");
}

/**
 * Upload a file to IPFS via Lighthouse.storage
 * @param file File to upload
 * @returns IPFS CID and gateway URL
 */
export async function uploadImage(file: File): Promise<{ cid: string; url: string }> {
  if (!LIGHTHOUSE_API_KEY) {
    throw new Error("LIGHTHOUSE_API_KEY is not configured. Please set it in your .env file.");
  }

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Upload to Lighthouse.storage
    const response = await fetch("https://node.lighthouse.storage/api/v0/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIGHTHOUSE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !data.Hash) {
      throw new Error("Failed to upload to Lighthouse: Invalid response");
    }

    const cid = data.Hash;
    
    // Construct gateway URL
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    return { cid, url };
  } catch (error) {
    console.error("Lighthouse upload error:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a blurred version of an image using canvas
 * Returns a File object with the blurred image
 */
export async function generateBlurredImage(file: File, blurAmount: number = 20): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply blur filter
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(img, 0, 0);

      // Convert to blob and then to File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          const blurredFile = new File([blob], `blurred-${file.name}`, {
            type: file.type,
          });
          resolve(blurredFile);
        },
        file.type,
        0.8 // Quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

