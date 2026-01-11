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
    ipnsBlurred?: string;
    ipnsOriginal?: string;
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
    ipnsBlurred?: string;
    ipnsOriginal?: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} not supported. Please use JPEG, PNG, WebP, or GIF.`;
    }

    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: validationError,
        });
        return;
      }

      // Process file directly
      processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: validationError,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Compress image if it's large
      let processedFile = file;
      if (file.size > 500 * 1024) { // Compress if over 500KB
        processedFile = await compressImage(file);
      }

      // Generate blurred version from compressed image
      const blurredFile = await generateBlurredImage(processedFile, 20);

      // Upload both images (now includes IPNS backup) with progress
      const [originalUpload, blurredUpload] = await Promise.all([
        uploadImage(processedFile, (progress) => setUploadProgress(progress * 0.5)), // 50% for original
        uploadImage(blurredFile, (progress) => setUploadProgress(50 + progress * 0.5)), // 50% for blurred
      ]);

      setPreviewUrl(blurredUpload.url);

      const uploadData = {
        blurredCid: blurredUpload.cid,
        originalCid: originalUpload.cid,
        blurredUrl: blurredUpload.url,
        originalUrl: originalUpload.url,
        ipnsBlurred: blurredUpload.ipnsUrl,
        ipnsOriginal: originalUpload.ipnsUrl,
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
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
                {isUploading ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Uploading... {uploadProgress.toFixed(0)}%
                    </span>
                    <div className="w-full bg-background/50 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Click to upload image or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      Supports JPEG, PNG, WebP, GIF up to 10MB
                    </span>
                  </>
                )}
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
          <label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
            Unlock Price (USDC)
            <span className="text-xs text-muted-foreground font-normal">(Required)</span>
          </label>
          <div className="relative">
            <input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
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
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              USDC
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Users will pay this amount in USDC to view the original image. Minimum: 0.01 USDC
          </p>
        </div>
      )}
    </div>
  );
}

