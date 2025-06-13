import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, type User, type PostWithUser, type InsertPost } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PostCard from "./post-card";
import LeaderboardSection from "./leaderboard-section";
import { Image, Smile, Loader2 } from "lucide-react";

interface FeedSectionProps {
  currentUser: User;
}

const avatarUrls = {
  "1": "https://auxfresh.github.io/freshhub/avater1.jpg",
  "2": "https://auxfresh.github.io/freshhub/avater2.jpg",
  "3": "https://auxfresh.github.io/freshhub/avater3.jpg",
};

export default function FeedSection({ currentUser }: FeedSectionProps) {
  const { toast } = useToast();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
    },
  });

  const { data: posts = [], isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost & { userId: number }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/posts`] });
      form.reset();
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPost) => {
    if (!data.content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something to share.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      ...data,
      userId: currentUser.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-social-primary" />
        <span className="ml-2 text-social-secondary">Loading posts...</span>
      </div>
    );
  }

  return (
    <section>
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-start space-x-4">
              <img 
                src={avatarUrls[currentUser.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                alt="Your avatar" 
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full resize-none border-gray-300 focus:ring-2 focus:ring-social-primary focus:border-transparent transition-all"
                          rows={3}
                          placeholder="What's on your mind?"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-4 text-social-secondary">
                    <button type="button" className="hover:text-social-primary transition-colors">
                      <Image className="w-5 h-5" />
                    </button>
                    <button type="button" className="hover:text-social-primary transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-social-primary text-white hover:bg-social-primary/90"
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Leaderboard */}
      <div className="mb-6">
        <LeaderboardSection currentUser={currentUser} />
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-social-secondary">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={`post-${post.id}`} post={post} currentUser={currentUser} />
          ))
        )}
      </div>
    </section>
  );
}
