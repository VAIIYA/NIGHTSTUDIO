// IPFS Storage APIs - Support multiple providers
// For client-side access in Next.js, use NEXT_PUBLIC_ prefix

// Primary: NFT.Storage (most reliable)
const NFT_STORAGE_API_KEY =
  process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY ||
  process.env.NFT_STORAGE_API_KEY;

// Fallback: Storacha/Lighthouse
const STORACHA_API_KEY =
  process.env.NEXT_PUBLIC_STORACHA_API_KEY ||
  process.env.STORACHA_API_KEY ||
  process.env.NEXT_PUBLIC_LIGHTHOUSE_STORAGE ||
  process.env.LIGHTHOUSE_STORAGE ||
  process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

// IPNS Backup Configuration
const IPFS_API_URL = process.env.NEXT_PUBLIC_IPFS_API_URL || 'http://localhost:5001';
const IPNS_KEY_NAME = process.env.NEXT_PUBLIC_IPNS_KEY_NAME || 'nightstudio';
const ENABLE_IPNS_BACKUP = process.env.NEXT_PUBLIC_ENABLE_IPNS_BACKUP === 'true';

// Check if at least one API key is configured
if (!NFT_STORAGE_API_KEY && !STORACHA_API_KEY) {
  console.warn("No IPFS storage API key configured. Image uploads will fail.");
  console.warn("Set NEXT_PUBLIC_NFT_STORAGE_API_KEY or NEXT_PUBLIC_STORACHA_API_KEY in Vercel environment variables.");
}

// IPNS Configuration Guide
console.log("📚 IPNS Backup Setup:");
console.log("1. Install IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/");
console.log("2. Enable HTTP API in IPFS Desktop settings");
console.log("3. Set environment variables:");
console.log("   - NEXT_PUBLIC_ENABLE_IPNS_BACKUP=true");
console.log("   - NEXT_PUBLIC_IPFS_API_URL=http://localhost:5001 (default)");
console.log("   - NEXT_PUBLIC_IPNS_KEY_NAME=nightstudio (your IPNS key name)");
console.log("4. Test connection: window.testIPNSConnection() in browser console");

// Log IPNS configuration
console.log("🔑 IPNS Backup enabled:", ENABLE_IPNS_BACKUP);
console.log("🌐 IPFS API URL:", IPFS_API_URL);
console.log("🔑 IPNS Key Name:", IPNS_KEY_NAME);

// Log API key status for debugging (without exposing the key)
console.log("🔑 NFT.Storage API Key configured:", !!NFT_STORAGE_API_KEY, NFT_STORAGE_API_KEY?.substring(0, 10) + "...");
console.log("🔑 Storacha API Key configured:", !!STORACHA_API_KEY, STORACHA_API_KEY?.substring(0, 10) + "...");

/**
 * Upload file to IPNS for backup/redundancy
 * @param file The file to upload
 * @param existingCid Optional existing CID to pin and publish to IPNS
 * @returns IPNS key/name or undefined if failed
 */
export async function uploadToIPNS(file: File, existingCid?: string): Promise<string | null> {
  try {
    let cid = existingCid;

    // If no existing CID, upload the file first
    if (!cid) {
      const formData = new FormData();
      formData.append("file", file);

      // Upload to IPFS first
      const ipfsResponse = await fetch(`${IPFS_API_URL}/api/v0/add`, {
        method: 'POST',
        body: formData,
      });

      if (!ipfsResponse.ok) {
        throw new Error(`IPFS upload failed: ${ipfsResponse.status}`);
      }

      const ipfsData = await ipfsResponse.json();
      cid = ipfsData.Hash;
    }

    if (!cid) {
      throw new Error("No CID available for IPNS publishing");
    }

    // Create IPNS key if it doesn't exist
    try {
      await fetch(`${IPFS_API_URL}/api/v0/key/gen?arg=${IPNS_KEY_NAME}&type=rsa&size=2048`, {
        method: 'POST',
      });
      console.log(`📝 Created new IPNS key: ${IPNS_KEY_NAME}`);
    } catch (keyError) {
      // Key might already exist, that's okay
      console.log(`ℹ️ IPNS key ${IPNS_KEY_NAME} already exists or creation failed`);
    }

    // Publish to IPNS
    const publishResponse = await fetch(`${IPFS_API_URL}/api/v0/name/publish?arg=${cid}&key=${IPNS_KEY_NAME}`, {
      method: 'POST',
    });

    if (!publishResponse.ok) {
      throw new Error(`IPNS publish failed: ${publishResponse.status}`);
    }

    const publishData = await publishResponse.json();
    console.log("📢 Published to IPNS:", publishData);

    return publishData.Name || IPNS_KEY_NAME;
  } catch (error) {
    console.error("IPNS upload error:", error);
    return null;
  }
}

/**
 * Upload a file to IPFS via Lighthouse.storage with optional IPNS backup
 * @param file File to upload
 * @returns IPFS CID, gateway URL, and optional IPNS URL
 */
export async function uploadImage(file: File): Promise<{ cid: string; url: string; ipnsUrl?: string }> {
  if (!NFT_STORAGE_API_KEY && !STORACHA_API_KEY) {
    throw new Error("No IPFS storage API key configured. Set NEXT_PUBLIC_NFT_STORAGE_API_KEY or NEXT_PUBLIC_STORACHA_API_KEY");
  }

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Use the same multi-provider logic for primary storage
    const cid = await uploadToLighthouse(formData);

    // Construct gateway URL - using IPFS gateway
    const url = `https://ipfs.io/ipfs/${cid}`;

    // Attempt IPNS backup if enabled
    let ipnsUrl: string | undefined;
    if (ENABLE_IPNS_BACKUP) {
      try {
        console.log("📤 Attempting IPNS backup...");
        const ipnsResult = await uploadToIPNS(file, cid);
        if (ipnsResult) {
          ipnsUrl = `https://ipfs.io/ipns/${ipnsResult}`;
          console.log("✅ IPNS backup successful:", ipnsUrl);
        }
      } catch (ipnsError) {
        console.warn("⚠️ IPNS backup failed, but primary upload succeeded:", ipnsError);
        // Don't fail the whole upload if IPNS backup fails
      }
    }

    return { cid, url, ipnsUrl };
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Upload FormData to Lighthouse (for profile images)
 * @param formData FormData containing the file
 * @returns IPFS CID
 */
// Configuration for multi-provider uploads
const MULTI_PROVIDER_BACKUP = process.env.NEXT_PUBLIC_ENABLE_MULTI_PROVIDER_BACKUP === 'true';

export async function uploadToLighthouse(formData: FormData): Promise<string> {
  const results: { provider: string; cid?: string; error?: string }[] = [];

  // Try Storacha first (primary)
  if (STORACHA_API_KEY) {
    try {
      console.log("📤 Trying Storacha (primary)...");

      const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STORACHA_API_KEY}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.Hash) {
          console.log("✅ Storacha success:", data.Hash);
          results.push({ provider: "storacha", cid: data.Hash });

          // If multi-provider backup is disabled, return immediately
          if (!MULTI_PROVIDER_BACKUP) {
            return data.Hash;
          }
        } else {
          results.push({ provider: "storacha", error: "Missing Hash in response" });
        }
      } else {
        const errorText = await response.text();
        console.warn("❌ Storacha failed:", errorText);
        results.push({ provider: "storacha", error: errorText });
      }
    } catch (error) {
      console.warn("💥 Storacha error:", error);
      results.push({ provider: "storacha", error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Try NFT.Storage (secondary)
  if (NFT_STORAGE_API_KEY) {
    try {
      console.log("📤 Trying NFT.Storage (secondary)...");

      const response = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.value?.cid) {
          console.log("✅ NFT.Storage success:", data.value.cid);
          results.push({ provider: "nft.storage", cid: data.value.cid });

          // If we don't have a primary result yet, use this one
          if (!results.find(r => r.cid) || !MULTI_PROVIDER_BACKUP) {
            return data.value.cid;
          }
        } else {
          results.push({ provider: "nft.storage", error: "Missing CID in response" });
        }
      } else {
        const errorText = await response.text();
        console.warn("❌ NFT.Storage failed:", errorText);
        results.push({ provider: "nft.storage", error: errorText });
      }
    } catch (error) {
      console.warn("💥 NFT.Storage error:", error);
      results.push({ provider: "nft.storage", error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Log results
  console.log("📊 Upload results:", results);

  // Return the first successful upload
  const success = results.find(r => r.cid);
  if (success && success.cid) {
    console.log(`🎯 Using ${success.provider} CID: ${success.cid}`);
    return success.cid;
  }

  // Check if any API keys are configured
  if (!NFT_STORAGE_API_KEY && !STORACHA_API_KEY) {
    throw new Error("No IPFS storage API key configured. Set NEXT_PUBLIC_NFT_STORAGE_API_KEY or NEXT_PUBLIC_STORACHA_API_KEY");
  }

  // All methods failed
  const errors = results.filter(r => r.error).map(r => `${r.provider}: ${r.error}`).join("; ");
  throw new Error(`All IPFS storage methods failed: ${errors}`);
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
  console.log("🔍 Testing Multi-Provider IPFS Storage...");
  console.log("Multi-provider backup:", MULTI_PROVIDER_BACKUP);
  console.log("NFT.Storage API Key configured:", !!NFT_STORAGE_API_KEY);
  console.log("Storacha API Key configured:", !!STORACHA_API_KEY);
  console.log("Environment variables checked:",
    Object.keys(process.env).filter(key =>
      key.toLowerCase().includes('nft') ||
      key.toLowerCase().includes('storacha') ||
      key.toLowerCase().includes('lighthouse') ||
      key.toLowerCase().includes('multi')
    )
  );

  if (!NFT_STORAGE_API_KEY && !STORACHA_API_KEY) {
    console.error("❌ No IPFS storage API keys found!");
    return { success: false, error: "No API keys" };
  }

  const results: { provider: string; success: boolean; cid?: string; error?: string; endpoint: string }[] = [];

  try {
    // Test Storacha first (primary)
    if (STORACHA_API_KEY) {
      console.log("🧪 Testing Storacha (primary)...");
      console.log("📋 Storacha API Key format:", {
        length: STORACHA_API_KEY.length,
        hasDots: STORACHA_API_KEY.includes('.'),
        startsWith: STORACHA_API_KEY.substring(0, 10),
        isDID: STORACHA_API_KEY.startsWith('did:key:')
      });

      try {
        const testFormData = new FormData();
        testFormData.append("file", new Blob(["test"], { type: "text/plain" }), "test.txt");

        const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STORACHA_API_KEY}`,
          },
          body: testFormData,
          signal: AbortSignal.timeout(15000),
        });

        console.log(`📡 Storacha - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Storacha test successful:", data);
          results.push({
            provider: "storacha",
            success: true,
            cid: data.Hash,
            endpoint: "https://node.lighthouse.storage/api/v0/add"
          });
        } else {
          const errorText = await response.text();
          console.log(`❌ Storacha failed:`, errorText);
          results.push({
            provider: "storacha",
            success: false,
            error: errorText,
            endpoint: "https://node.lighthouse.storage/api/v0/add"
          });
        }
      } catch (err) {
        console.log(`💥 Storacha error:`, err instanceof Error ? err.message : String(err));
        results.push({
          provider: "storacha",
          success: false,
          error: err instanceof Error ? err.message : String(err),
          endpoint: "https://node.lighthouse.storage/api/v0/add"
        });
      }
    }

    // Test NFT.Storage (secondary)
    if (NFT_STORAGE_API_KEY) {
      console.log("🧪 Testing NFT.Storage (secondary)...");
      console.log("📋 NFT.Storage API Key format:", {
        length: NFT_STORAGE_API_KEY.length,
        hasDots: NFT_STORAGE_API_KEY.includes('.'),
        startsWith: NFT_STORAGE_API_KEY.substring(0, 10)
      });

      try {
        const testFormData = new FormData();
        testFormData.append("file", new Blob(["test"], { type: "text/plain" }), "test.txt");

        const response = await fetch("https://api.nft.storage/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
          },
          body: testFormData,
          signal: AbortSignal.timeout(15000),
        });

        console.log(`📡 NFT.Storage - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ NFT.Storage test successful:", data);
          results.push({
            provider: "nft.storage",
            success: true,
            cid: data.value?.cid,
            endpoint: "https://api.nft.storage/upload"
          });
        } else {
          const errorText = await response.text();
          console.log(`❌ NFT.Storage failed:`, errorText);
          results.push({
            provider: "nft.storage",
            success: false,
            error: errorText,
            endpoint: "https://api.nft.storage/upload"
          });
        }
      } catch (err) {
        console.log(`💥 NFT.Storage error:`, err instanceof Error ? err.message : String(err));
        results.push({
          provider: "nft.storage",
          success: false,
          error: err instanceof Error ? err.message : String(err),
          endpoint: "https://api.nft.storage/upload"
        });
      }
    }

    console.log("📊 Complete test results:", results);

    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
      console.log(`✅ ${successful.length} provider(s) working:`, successful.map(r => r.provider));
      return {
        success: true,
        results,
        primary: successful[0],
        message: `${successful.length} provider(s) working successfully`
      };
    } else {
      console.error("❌ All storage providers failed");
      return {
        success: false,
        results,
        error: "All providers failed: " + results.map(r => `${r.provider}: ${r.error}`).join("; ")
      };
    }

  } catch (error) {
    console.error("❌ IPFS storage test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Alternative upload method using Lighthouse SDK approach
 */
export async function uploadWithLighthouseSDK(file: File): Promise<string> {
  // Use the same multi-provider logic as the main upload function
  const formData = new FormData();
  formData.append("file", file);

  return uploadToLighthouse(formData);
}

// Test IPNS connection
export async function testIPNSConnection() {
  try {
    console.log("🧪 Testing IPNS connection...");
    console.log("🌐 IPFS API URL:", IPFS_API_URL);
    console.log("🔑 IPNS Key Name:", IPNS_KEY_NAME);
    console.log("📤 IPNS Backup enabled:", ENABLE_IPNS_BACKUP);

    if (!ENABLE_IPNS_BACKUP) {
      console.log("ℹ️ IPNS backup is disabled");
      return { success: false, disabled: true };
    }

    // Test IPFS API connection
    try {
      const response = await fetch(`${IPFS_API_URL}/api/v0/id`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`IPFS API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ IPFS API connected:", data.ID);

      // Test IPNS key
      const keyResponse = await fetch(`${IPFS_API_URL}/api/v0/key/list`, {
        signal: AbortSignal.timeout(5000),
      });

      if (keyResponse.ok) {
        const keyData = await keyResponse.json();
        const keyExists = keyData.Keys?.some((key: any) => key.Name === IPNS_KEY_NAME);
        console.log(`📝 IPNS key "${IPNS_KEY_NAME}" ${keyExists ? 'exists' : 'does not exist'}`);

        return {
          success: true,
          ipfsConnected: true,
          ipnsKeyExists: keyExists,
          ipfsId: data.ID,
        };
      }

    } catch (apiError) {
      console.error("❌ IPFS API connection failed:", apiError);
      return {
        success: false,
        error: apiError instanceof Error ? apiError.message : String(apiError),
      };
    }

  } catch (error) {
    console.error("❌ IPNS test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testLighthouseConnection = testLighthouseConnection;
  (window as any).uploadWithLighthouseSDK = uploadWithLighthouseSDK;
  (window as any).testIPNSConnection = testIPNSConnection;
}

