"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Profile } from "@/types";
import { getProfile, updateProfile } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Upload, ImageIcon, User } from "lucide-react";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { uploadFile, validateFile } from "@/lib/storacha";

export default function EditProfilePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ type: 'avatar' | 'banner'; percentage: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      router.push("/");
      return;
    }

    const loadProfile = async () => {
      try {
        const profileData = await getProfile(publicKey.toString());
        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.displayName || "");
          setUsername(profileData.username || "");
          setBio(profileData.bio || "");
          setWebsite(profileData.website || "");
          setLocation(profileData.location || "");
          setAvatarPreview(null);
          setBannerPreview(null);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [connected, publicKey, router, toast]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: validation.error,
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: validation.error,
        });
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) return;

    setIsSaving(true);

    try {
      let avatarCid = undefined;
      let bannerCid = undefined;

      // Upload images if changed
      if (avatarFile) {
        try {
          setIsUploading(true);
          setUploadProgress({ type: 'avatar', percentage: 0 });
          toast({
            title: "Uploading Avatar...",
            description: "Please wait while we upload your image.",
          });
          const result = await uploadFile(avatarFile, (progress) => {
            setUploadProgress({ type: 'avatar', percentage: progress.percentage });
          });
          avatarCid = result.url;
          setUploadProgress({ type: 'avatar', percentage: 100 });
        } catch (error) {
          console.error("Avatar upload failed:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Could not upload avatar image",
          });
        }
      }

      if (bannerFile) {
        try {
          setIsUploading(true);
          setUploadProgress({ type: 'banner', percentage: 0 });
          toast({
            title: "Uploading Banner...",
            description: "Please wait while we upload your banner.",
          });
          const result = await uploadFile(bannerFile, (progress) => {
            setUploadProgress({ type: 'banner', percentage: progress.percentage });
          });
          bannerCid = result.url;
          setUploadProgress({ type: 'banner', percentage: 100 });
        } catch (error) {
          console.error("Banner upload failed:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Could not upload banner image",
          });
        }
      }

      setIsUploading(false);
      setUploadProgress(null);

      setIsSaving(true);

      // Update profile
      await updateProfile(publicKey.toString(), {
        displayName: displayName.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        website: website.trim() || undefined,
        location: location.trim() || undefined,
        avatar: avatarCid,
        banner: bannerCid,
      });

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });

      router.push(`/profile/${publicKey.toString()}`);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please connect your wallet to edit your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingChecklist profile={profile} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Upload */}
            <div className="relative group">
              <Label htmlFor="banner-upload" className="cursor-pointer block">
                <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden bg-secondary/20 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors flex items-center justify-center relative">
                   {(bannerPreview || profile?.banner) ? (
                     <Image
                       src={bannerPreview || profile?.banner || ""}
                       alt="Banner"
                       fill
                       className="object-cover"
                     />
                   ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <span className="text-sm">Upload Banner</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Upload className="h-6 w-6 mr-2" />
                    <span className="font-medium">Change Banner</span>
                  </div>
                </div>
              </Label>
              <Input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>

            {/* Avatar Upload */}
            <div className="relative -mt-16 ml-4 w-24 h-24 md:w-32 md:h-32 group">
              <Label htmlFor="avatar-upload" className="cursor-pointer block relative">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-secondary/20 shadow-lg relative">
                   {(avatarPreview || profile?.avatar) ? (
                     <Image
                       src={avatarPreview || profile?.avatar || ""}
                       alt="Avatar"
                       fill
                       className="object-cover"
                     />
                   ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full">
                    <Upload className="h-5 w-5" />
                  </div>
                </div>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                className="bg-secondary/20 border-primary/10 focus:border-primary/50"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                maxLength={30}
                className="bg-secondary/20 border-primary/10 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choose a unique username (optional)
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={160}
                rows={3}
                className="bg-secondary/20 border-primary/10 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {bio.length}/160
              </p>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                maxLength={30}
                className="bg-secondary/20 border-primary/10 focus:border-primary/50"
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                type="url"
                className="bg-secondary/20 border-primary/10 focus:border-primary/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadProgress?.type === 'avatar' ? 'Uploading Avatar...' : 'Uploading Banner...'}
                    ({uploadProgress?.percentage}%)
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  );
}