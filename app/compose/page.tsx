"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { ImageUploadWithPrice } from "@/components/ImageUploadWithPrice";
import { createPost } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";

interface ImageData {
  blurredCid: string;
  originalCid: string;
  blurredUrl: string;
  originalUrl: string;
}

export default function ComposePage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (data: ImageData & { price: number }) => {
    setImageData({
      blurredCid: data.blurredCid,
      originalCid: data.originalCid,
      blurredUrl: data.blurredUrl,
      originalUrl: data.originalUrl,
    });
    setPrice(data.price);
  };

  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to post",
      });
      return;
    }

    if (!content.trim() && !imageData) {
      toast({
        variant: "destructive",
        title: "Empty post",
        description: "Please add some content or an image",
      });
      return;
    }

    if (imageData && price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Please set a price greater than 0 for paid content",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        author: publicKey.toString(),
        content: content.trim(),
        imageBlurred: imageData?.blurredCid,
        imageOriginal: imageData?.originalCid,
        imagePrice: imageData && price > 0 ? price : undefined,
      });

      toast({
        variant: "success",
        title: "Post created!",
        description: "Your post has been published",
      });

      // Reset form
      setContent("");
      setImageData(null);
      setPrice(0);

      // Navigate to home
      router.push("/");
    } catch (error: any) {
      console.error("Failed to create post:", error);
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">
                Connect Wallet Required
              </h3>
              <p className="text-sm text-yellow-300">
                Please connect your wallet to create a post
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Textarea */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            What's happening?
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full min-h-[120px] px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {content.length}/280
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Add Image (Optional)
          </label>
          <ImageUploadWithPrice
            onUploadComplete={(data) => {
              handleImageUpload(data);
              // Extract price from the component if needed
            }}
            onRemove={() => {
              setImageData(null);
              setPrice(0);
            }}
            initialBlurredUrl={imageData?.blurredUrl}
            initialPrice={price}
          />
          {imageData && (
            <div className="mt-2">
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Unlock Price (USDC)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                required={!!imageData}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Users will pay this amount to view the original image
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

