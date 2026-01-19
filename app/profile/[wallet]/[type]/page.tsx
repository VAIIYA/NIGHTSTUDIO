"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Profile } from "@/types";
import { getFollowers, getFollowing } from "@/lib/server-actions";
import { shortenAddress } from "@/lib/utils";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Users } from "lucide-react";

type ListType = 'followers' | 'following';

export default function FollowListPage() {
  const params = useParams();
  const router = useRouter();
  const wallet = params.wallet as string;
  const listType = params.type as ListType;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet || !listType) return;

    const loadList = async () => {
      try {
        setIsLoading(true);
        let fetchedProfiles: Profile[];

        if (listType === 'followers') {
          fetchedProfiles = await getFollowers(wallet, 100, 0);
        } else {
          fetchedProfiles = await getFollowing(wallet, 100, 0);
        }

        setProfiles(fetchedProfiles);
      } catch (err) {
        setError("Failed to load list");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadList();
  }, [wallet, listType]);

  const handleFollowChange = (targetWallet: string, isFollowing: boolean) => {
    // Update the profile in the list
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.wallet === targetWallet
          ? { ...profile, followers: profile.followers + (isFollowing ? 1 : -1) }
          : profile
      )
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold capitalize">{listType}</h1>
            <p className="text-sm text-muted-foreground">
              {shortenAddress(wallet)}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {listType === 'followers'
              ? "No followers yet"
              : "Not following anyone yet"
            }
          </p>
        </div>
      ) : (
        <div>
          {profiles.map((profile) => (
            <div
              key={profile.wallet}
              className="border-b border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => router.push(`/profile/${profile.wallet}`)}
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-mono">
                      {shortenAddress(profile.wallet, 2)}
                    </span>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                      </h3>
                      {profile.verified && (
                        <span className="text-primary text-sm">✓</span>
                      )}
                    </div>
                    {profile.username && (
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                <FollowButton
                  targetWallet={profile.wallet}
                  onFollowChange={(isFollowing) =>
                    handleFollowChange(profile.wallet, isFollowing)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}