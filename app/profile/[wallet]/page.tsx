"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { TweetCard } from "@/components/TweetCard";
import { FollowButton } from "@/components/FollowButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { Post, Profile } from "@/types";
import { getPosts, getProfile } from "@/lib/server-actions";
import { shortenAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, MapPin, Link as LinkIcon, Calendar, Settings, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey } = useWallet();
  const wallet = params.wallet as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const isOwnProfile = publicKey?.toString() === wallet;

  useEffect(() => {
    if (!wallet) return;

    const loadData = async () => {
      try {
        // Load profile data
        setIsLoadingProfile(true);
        const profileData = await getProfile(wallet);
        setProfile(profileData);

        // Load posts
        setIsLoadingPosts(true);
        const { getPostsByAuthor } = await import("@/lib/server-actions");
        const userPosts = await getPostsByAuthor(wallet, 100, 0);
        setPosts(userPosts);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingPosts(false);
      }
    };

    loadData();
  }, [wallet]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="border-b border-border p-6">
        {/* Banner */}
        {/* Banner removed (IPFS removed) */}

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background relative z-10">
            <span className="text-lg font-mono">
              {shortenAddress(wallet, 3)}
            </span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile?.displayName || profile?.username || shortenAddress(wallet)}
                </h1>
                {profile?.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
              </div>
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/profile/edit')}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile/${wallet}/subscriptions`)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Subscriptions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile/${wallet}/analytics`)}
                      className="flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Analytics
                    </Button>
                  </>
                ) : (
                  <>
                    <FollowButton
                      targetWallet={wallet}
                      onFollowChange={(isFollowing) => {
                        if (profile) {
                          setProfile({
                            ...profile,
                            followers: profile.followers + (isFollowing ? 1 : -1)
                          });
                        }
                      }}
                    />
                    <SubscribeButton creator={wallet} />
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm mb-3">{profile.bio}</p>
            )}

            {/* Profile Details */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => router.push(`/profile/${wallet}/following`)}
                className="hover:underline"
              >
                <span className="font-bold text-foreground">{profile?.following || 0}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </button>
              <button
                onClick={() => router.push(`/profile/${wallet}/followers`)}
                className="hover:underline"
              >
                <span className="font-bold text-foreground">{profile?.followers || 0}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </button>
              <div>
                <span className="font-bold text-foreground">{posts.length}</span>
                <span className="text-muted-foreground ml-1">Posts</span>
              </div>
              {isOwnProfile && (
                <div>
                  <span className="font-bold text-foreground">{profile?.earnings || 0}</span>
                  <span className="text-muted-foreground ml-1">USDC Earned</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono break-all">
            Wallet: {wallet}
          </p>
        </div>
      </div>

      {/* Posts */}
      {isLoadingPosts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <TweetCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

