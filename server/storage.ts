import { users, posts, type User, type InsertUser, type Post, type InsertPost, type UpdateUser, type PostWithUser } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  getLeaderboard(): Promise<User[]>;
  
  // Post operations
  createPost(userId: number, post: InsertPost): Promise<Post>;
  getPosts(): Promise<PostWithUser[]>;
  getUserPosts(userId: number): Promise<PostWithUser[]>;
  likePost(postId: number, userId: number): Promise<Post | undefined>;
  incrementPostScore(postId: number, points: number): Promise<void>;
  incrementUserScore(userId: number, points: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private userIdCounter: number;
  private postIdCounter: number;
  private postLikes: Map<number, Set<number>>; // postId -> Set of userIds who liked

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.postLikes = new Map();
    
    // Initialize with some sample users for leaderboard
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleUsers = [
      { username: "Mike Chen", bio: "Frontend Developer", avatar: "2", score: 1456, postsCount: 24, followersCount: 892, followingCount: 156 },
      { username: "Sarah Johnson", bio: "UX Designer", avatar: "1", score: 1247, postsCount: 18, followersCount: 743, followingCount: 234 },
      { username: "Emma Rodriguez", bio: "Full Stack Developer", avatar: "3", score: 1089, postsCount: 31, followersCount: 567, followingCount: 189 },
      { username: "Alex Thompson", bio: "Product Manager", avatar: "2", score: 967, postsCount: 15, followersCount: 432, followingCount: 98 },
      { username: "Jessica Wilson", bio: "Data Scientist", avatar: "1", score: 834, postsCount: 22, followersCount: 321, followingCount: 167 },
    ];

    sampleUsers.forEach(userData => {
      const user: User = {
        id: this.userIdCounter++,
        ...userData,
        followersCount: userData.followersCount,
        followingCount: userData.followingCount,
      };
      this.users.set(user.id, user);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      ...insertUser,
      score: 0,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...updateUser,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  async createPost(userId: number, insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const post: Post = {
      id,
      userId,
      ...insertPost,
      likes: 0,
      comments: 0,
      score: 0,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    this.postLikes.set(id, new Set());

    // Update user's post count
    const user = this.users.get(userId);
    if (user) {
      user.postsCount += 1;
      this.users.set(userId, user);
    }

    return post;
  }

  async getPosts(): Promise<PostWithUser[]> {
    const postsArray = Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return postsArray.map(post => {
      const user = this.users.get(post.userId);
      return {
        ...post,
        user: user!,
      };
    });
  }

  async getUserPosts(userId: number): Promise<PostWithUser[]> {
    const userPosts = Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const user = this.users.get(userId);
    return userPosts.map(post => ({
      ...post,
      user: user!,
    }));
  }

  async likePost(postId: number, userId: number): Promise<Post | undefined> {
    const post = this.posts.get(postId);
    if (!post) return undefined;

    const likedUsers = this.postLikes.get(postId) || new Set();
    
    if (likedUsers.has(userId)) {
      // Unlike
      likedUsers.delete(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      likedUsers.add(userId);
      post.likes += 1;
      
      // Award points for engagement
      await this.incrementPostScore(postId, 1);
      await this.incrementUserScore(post.userId, 1);
    }

    this.postLikes.set(postId, likedUsers);
    this.posts.set(postId, post);
    return post;
  }

  async incrementPostScore(postId: number, points: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.score += points;
      this.posts.set(postId, post);
    }
  }

  async incrementUserScore(userId: number, points: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.score += points;
      this.users.set(userId, user);
    }
  }
}

export const storage = new MemStorage();
