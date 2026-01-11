"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Profile } from "@/types";
import { getProfile, updateProfile } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { uploadToLighthouse } from "@/lib/lighthouse";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

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
          setAvatarPreview(profileData.avatar ? `https://ipfs.io/ipfs/${profileData.avatar}` : null);
          setBannerPreview(profileData.banner ? `https://ipfs.io/ipfs/${profileData.banner}` : null);
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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      let avatarCid = profile?.avatar;
      let bannerCid = profile?.banner;

      // Upload avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("file", avatarFile);
        avatarCid = await uploadToLighthouse(avatarFormData);
      }

      // Upload banner if changed
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", bannerFile);
        bannerCid = await uploadToLighthouse(bannerFormData);
      }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information and photos</p>
      </div>

      <OnboardingChecklist profile={profile} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Upload */}
        <div>
          <Label className="block text-sm font-medium mb-2">Banner Image</Label>
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload banner</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {bannerPreview && (
              <button
                type="button"
                onClick={() => {
                  setBannerFile(null);
                  setBannerPreview(null);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <Label className="block text-sm font-medium mb-2">Profile Picture</Label>
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
            />
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="absolute -top-1 -right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
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
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
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
    </div>
  );
}