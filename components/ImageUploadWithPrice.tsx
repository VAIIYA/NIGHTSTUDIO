"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, generateBlurredImage } from "@/lib/lighthouse";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadWithPriceProps {
  onUploadComplete: (data: {
    blurredCid: string;
    originalCid: string;
    blurredUrl: string;
    originalUrl: string;
    price: number;
  }) => void;
  onRemove: () => void;
  initialBlurredUrl?: string;
  initialPrice?: number;
}

export function ImageUploadWithPrice({
  onUploadComplete,
  onRemove,
  initialBlurredUrl,
  initialPrice,
}: ImageUploadWithPriceProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState<number>(initialPrice || 0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialBlurredUrl || null);
  const [imageData, setImageData] = useState<{
    blurredCid: string;
    originalCid: string;
    blurredUrl: string;
    originalUrl: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select an image file",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate blurred version
      const blurredFile = await generateBlurredImage(file, 20);

      // Upload both images
      const [originalUpload, blurredUpload] = await Promise.all([
        uploadImage(file),
        uploadImage(blurredFile),
      ]);

      setPreviewUrl(blurredUpload.url);

      const uploadData = {
        blurredCid: blurredUpload.cid,
        originalCid: originalUpload.cid,
        blurredUrl: blurredUpload.url,
        originalUrl: originalUpload.url,
      };
      
      setImageData(uploadData);

      onUploadComplete({
        ...uploadData,
        price: price || 0,
      });

      toast({
        variant: "success",
        title: "Image uploaded",
        description: "Image uploaded to IPFS successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setPrice(0);
    setImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!previewUrl && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover blur-xl"
              priority
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Price Input */}
      {previewUrl && (
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Unlock Price (USDC)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => {
              const newPrice = parseFloat(e.target.value) || 0;
              setPrice(newPrice);
              // Notify parent of price change
              if (imageData) {
                onUploadComplete({
                  ...imageData,
                  price: newPrice,
                });
              }
            }}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00"
          />
          <p className="text-xs text-muted-foreground">
            Users will pay this amount in USDC to view the original image
          </p>
        </div>
      )}
    </div>
  );
}

