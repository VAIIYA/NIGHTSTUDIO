// Storacha (formerly Lighthouse) API
// Note: Storacha is the new name for Lighthouse.storage
// Support multiple env var names for flexibility
// For client-side access in Next.js, use NEXT_PUBLIC_ prefix
const STORACHA_API_KEY =
  process.env.NEXT_PUBLIC_STORACHA_API_KEY ||
  process.env.STORACHA_API_KEY ||
  process.env.NEXT_PUBLIC_LIGHTHOUSE_STORAGE ||
  process.env.LIGHTHOUSE_STORAGE ||
  process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

if (!STORACHA_API_KEY) {
  console.warn("STORACHA_API_KEY or LIGHTHOUSE_STORAGE not set. Image uploads will fail.");
  console.warn("Make sure to set NEXT_PUBLIC_STORACHA_API_KEY or NEXT_PUBLIC_LIGHTHOUSE_API_KEY in your Vercel environment variables.");
}

// Log API key status for debugging (without exposing the key)
console.log("🔑 Storacha API Key configured:", !!STORACHA_API_KEY, STORACHA_API_KEY?.substring(0, 10) + "...");

/**
 * Upload a file to IPFS via Lighthouse.storage
 * @param file File to upload
 * @returns IPFS CID and gateway URL
 */
export async function uploadImage(file: File): Promise<{ cid: string; url: string }> {
  if (!STORACHA_API_KEY) {
    throw new Error("STORACHA_API_KEY or LIGHTHOUSE_API_KEY is not configured. Please set it in your .env file.");
  }

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Upload to Storacha (formerly Lighthouse)
    const response = await fetch("https://api.storacha.network/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STORACHA_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Storacha upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data || !data.cid) {
      throw new Error("Failed to upload to Storacha: Invalid response");
    }

    const cid = data.cid;

    // Construct gateway URL - using IPFS gateway
    const url = `https://ipfs.io/ipfs/${cid}`;

    return { cid, url };
  } catch (error) {
    console.error("Storacha upload error:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Upload FormData to Lighthouse (for profile images)
 * @param formData FormData containing the file
 * @returns IPFS CID
 */
export async function uploadToLighthouse(formData: FormData): Promise<string> {
  if (!STORACHA_API_KEY) {
    console.error("Storacha API Key not found. Checked env vars:", {
      NEXT_PUBLIC_STORACHA_API_KEY: !!process.env.NEXT_PUBLIC_STORACHA_API_KEY,
      STORACHA_API_KEY: !!process.env.STORACHA_API_KEY,
      NEXT_PUBLIC_LIGHTHOUSE_STORAGE: !!process.env.NEXT_PUBLIC_LIGHTHOUSE_STORAGE,
      LIGHTHOUSE_STORAGE: !!process.env.LIGHTHOUSE_STORAGE,
      NEXT_PUBLIC_LIGHTHOUSE_API_KEY: !!process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
    });
    throw new Error("STORACHA_API_KEY or LIGHTHOUSE_API_KEY is not configured. Please set it in your .env file.");
  }

  console.log("Attempting Storacha upload with API key present:", !!STORACHA_API_KEY);

  // Try multiple endpoints in order of preference
  const endpoints = [
    "https://api.storacha.network/upload",              // Primary Storacha endpoint
    "https://upload.ipfs.storacha.network/upload",      // Alternative Storacha endpoint
    "https://node.lighthouse.storage/api/v0/add",       // Legacy Lighthouse endpoint
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STORACHA_API_KEY}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Storacha API Error for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        // If it's a 401/403, the API key is likely invalid
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication failed: Invalid API key or insufficient permissions`);
        }

        // Continue to next endpoint for other errors
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        continue;
      }

      const data = await response.json();
      console.log(`Success with ${endpoint}:`, data);

      // Handle different response formats
      const cid = data.cid || data.Hash;
      if (!cid) {
        console.error("Storacha API Response missing cid/Hash:", data);
        lastError = new Error("Invalid response: missing cid or Hash field");
        continue;
      }

      return cid;

    } catch (error) {
      console.warn(`Failed with ${endpoint}:`, error instanceof Error ? error.message : String(error));
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // All endpoints failed
  throw lastError || new Error("All Storacha upload endpoints failed");
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

/**
 * Debug function to test Lighthouse API connection
 * Call this from browser console: window.testLighthouseConnection()
 */
export async function testLighthouseConnection() {
  console.log("🔍 Testing Storacha (formerly Lighthouse) Connection...");
  console.log("API Key configured:", !!STORACHA_API_KEY);
  console.log("API Key preview:", STORACHA_API_KEY?.substring(0, 20) + "...");
  console.log("Environment variables checked:",
    Object.keys(process.env).filter(key => key.toLowerCase().includes('storacha') || key.toLowerCase().includes('lighthouse'))
  );

  if (!STORACHA_API_KEY) {
    console.error("❌ No Storacha API key found!");
    return { success: false, error: "No API key" };
  }

  try {
    // Test 1: Check API key format
    console.log("📋 API Key format check:", {
      length: STORACHA_API_KEY.length,
      hasDots: STORACHA_API_KEY.includes('.'),
      startsWith: STORACHA_API_KEY.substring(0, 10),
      isDID: STORACHA_API_KEY.startsWith('did:key:')
    });

    // Test 2: Try different endpoints
    const endpoints = [
      "https://api.storacha.network/upload",
      "https://upload.ipfs.storacha.network/upload",
      "https://node.lighthouse.storage/api/v0/add",  // Legacy fallback
    ];

    for (const endpoint of endpoints) {
      console.log(`🌐 Testing endpoint: ${endpoint}`);

      try {
        const testFormData = new FormData();
        testFormData.append("file", new Blob(["test"], { type: "text/plain" }), "test.txt");

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STORACHA_API_KEY}`,
          },
          body: testFormData,
          signal: AbortSignal.timeout(15000),
        });

        console.log(`📡 ${endpoint} - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Storacha test successful:", data);
          return { success: true, data, endpoint };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${endpoint} failed:`, errorText);
        }
      } catch (err) {
        console.log(`💥 ${endpoint} error:`, err instanceof Error ? err.message : String(err));
      }
    }

    console.error("❌ All endpoints failed");
    return { success: false, error: "All endpoints failed" };

  } catch (error) {
    console.error("❌ Storacha test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Alternative upload method using Lighthouse SDK approach
 */
export async function uploadWithLighthouseSDK(file: File): Promise<string> {
  // This is a fallback method that mimics the Storacha SDK approach
  const formData = new FormData();
  formData.append("file", file);

  // Try the working Storacha endpoints
  const workingEndpoints = [
    "https://api.storacha.network/upload",
    "https://upload.ipfs.storacha.network/upload",
    "https://node.lighthouse.storage/api/v0/add"  // Legacy fallback
  ];

  for (const endpoint of workingEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STORACHA_API_KEY}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        const cid = data.cid || data.Hash;
        if (cid) {
          return cid;
        }
      }
    } catch (error) {
      console.warn(`Failed with ${endpoint}:`, error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error("All Storacha upload methods failed");
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testLighthouseConnection = testLighthouseConnection;
  (window as any).uploadWithLighthouseSDK = uploadWithLighthouseSDK;
}

