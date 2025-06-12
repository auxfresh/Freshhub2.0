import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered: (user: User) => void;
}

const avatarOptions = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    alt: "Avatar option 1"
  },
  {
    id: "2", 
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    alt: "Avatar option 2"
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150", 
    alt: "Avatar option 3"
  }
];

export default function RegistrationModal({ isOpen, onClose, onUserRegistered }: RegistrationModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState("2");
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      bio: "",
      avatar: "2",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: (user: User) => {
      toast({
        title: "Welcome to SocialHub!",
        description: "Your profile has been created successfully.",
      });
      onUserRegistered(user);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    createUserMutation.mutate({
      ...data,
      avatar: selectedAvatar,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to SocialHub</DialogTitle>
          <p className="text-social-secondary text-sm text-center">Create your profile to get started</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Selection */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Avatar</label>
              <div className="flex justify-center space-x-3 mb-4">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`w-16 h-16 rounded-full border-2 overflow-hidden hover:border-social-primary transition-colors ${
                      selectedAvatar === avatar.id ? "border-social-primary" : "border-gray-200"
                    }`}
                  >
                    <img 
                      src={avatar.src} 
                      alt={avatar.alt} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea 
                      placeholder="Tell us about yourself..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-social-primary text-white hover:bg-social-primary/90"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
