import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, type User, type UpdateUser, type PostWithUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PostCard from "./post-card";
import { Edit, Loader2 } from "lucide-react";

interface ProfileSectionProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

const avatarUrls = {
  "1": "https://auxfresh.github.io/freshhub/avater1.jpg",
  "2": "https://auxfresh.github.io/freshhub/avater2.jpg",
  "3": "https://auxfresh.github.io/freshhub/avater3.jpg",
};

export default function ProfileSection({ currentUser, onUserUpdated }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: currentUser.username,
      bio: currentUser.bio,
      avatar: currentUser.avatar,
    },
  });

  const { data: userPosts = [], isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: [`/api/users/${currentUser.id}/posts`],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUser) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}`, userData);
      return await response.json();
    },
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setIsEditing(false);
      onUserUpdated(updatedUser);
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    updateUserMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      username: currentUser.username,
      bio: currentUser.bio,
      avatar: currentUser.avatar,
    });
  };

  return (
    <section className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <img 
              src={avatarUrls[currentUser.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
              alt="Profile avatar" 
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.username}</h1>
              <p className="text-social-secondary mb-3">{currentUser.bio}</p>
              <div className="flex space-x-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{currentUser.postsCount}</span>
                  <span className="text-social-secondary ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{currentUser.followersCount.toLocaleString()}</span>
                  <span className="text-social-secondary ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{currentUser.followingCount}</span>
                  <span className="text-social-secondary ml-1">Following</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} className="resize-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  className="bg-social-primary text-white hover:bg-social-primary/90"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* User's Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Posts</h2>
        </div>
        
        {postsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-social-primary" />
            <span className="ml-2 text-social-secondary">Loading your posts...</span>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="p-6 text-center text-social-secondary">
            <p>You haven't posted anything yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userPosts.map((post) => (
              <div key={post.id} className="p-6">
                <PostCard post={post} currentUser={currentUser} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
