import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PostWithUser, User } from "@shared/schema";
import { Heart, MessageCircle, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: PostWithUser;
  currentUser: User;
  compact?: boolean;
}

const avatarUrls = {
  "1": "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "2": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "3": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
};

export default function PostCard({ post, currentUser, compact = false }: PostCardProps) {
  const { toast } = useToast();

  const likePostMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`, {
        userId: currentUser.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/posts`] });
    },
    onError: () => {
      toast({
        title: "Failed to like post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likePostMutation.mutate();
  };

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "Share functionality would be implemented here.",
    });
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  if (compact) {
    return (
      <div className="flex items-start space-x-3">
        <img 
          src={avatarUrls[post.user.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
          alt="User avatar" 
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
            <span className="text-sm text-social-secondary">{timeAgo}</span>
          </div>
          <p className="text-gray-800 mb-3">{post.content}</p>
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt="Post image" 
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
          )}
          <div className="flex items-center space-x-4 text-sm text-social-secondary">
            <span>
              <Heart className="w-4 h-4 inline mr-1" />
              {post.likes} likes
            </span>
            <span>
              <MessageCircle className="w-4 h-4 inline mr-1" />
              {post.comments} comments
            </span>
            <span className="text-social-success">+{post.score} points</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={avatarUrls[post.user.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
            alt="User avatar" 
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
            <p className="text-sm text-social-secondary">{timeAgo}</p>
          </div>
        </div>
        
        <p className="text-gray-800 mb-4">{post.content}</p>
        
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-6">
            <button 
              onClick={handleLike}
              disabled={likePostMutation.isPending}
              className="flex items-center space-x-2 text-social-secondary hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-social-secondary hover:text-social-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-social-secondary hover:text-social-primary transition-colors"
            >
              <Share className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          <span className="text-sm text-social-secondary">+{post.score} points</span>
        </div>
      </div>
    </article>
  );
}
