import { database } from './firebase';
import { ref, set, get, push, update, orderByChild, query, limitToFirst } from 'firebase/database';
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

export class FirebaseStorage implements IStorage {
  private userIdCounter: number = 1;
  private postIdCounter: number = 1;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeSampleData();
  }

  private async ensureInitialized() {
    await this.initPromise;
  }

  private async initializeSampleData() {
    try {
      // Check if users already exist
      const usersRef = ref(database, 'communityUsers');
      const snapshot = await get(usersRef);
      const existingUsers = snapshot.exists() ? snapshot.val() : {};
      const userCount = Object.keys(existingUsers || {}).length;

      console.log(`Found ${userCount} existing users`);

      // Only initialize if we have fewer than 5 users
      if (userCount < 5) {
        const sampleUsers = [
          { username: "Fresh Hub Ai", bio: "Frontend Developer", avatar: "2", score: 1456, postsCount: 24, followersCount: 892, followingCount: 156 },
          { username: "Fresh Hub Ai", bio: "UX Designer", avatar: "1", score: 1247, postsCount: 18, followersCount: 743, followingCount: 234 },
          { username: "Fresh Hub Ai", bio: "Full Stack Developer", avatar: "3", score: 1089, postsCount: 31, followersCount: 567, followingCount: 189 },
          { username: "Fresh Hub Ai", bio: "Product Manager", avatar: "2", score: 967, postsCount: 15, followersCount: 432, followingCount: 98 },
          { username: "Fresh Hub Ai", bio: "Data Scientist", avatar: "1", score: 834, postsCount: 22, followersCount: 321, followingCount: 167 },
        ];

        // Get the current max user ID
        await this.updateCounters();

        console.log('Creating sample users...');
        for (const userData of sampleUsers) {
          // Check if user already exists by username
          const existingUser = Object.values(existingUsers || {}).find((user: any) => user.username === userData.username);
          
          if (!existingUser) {
            const user: User = {
              id: this.userIdCounter++,
              ...userData,
              followersCount: userData.followersCount,
              followingCount: userData.followingCount,
            };
            await set(ref(database, `communityUsers/${user.id}`), user);
            console.log(`Created user: ${user.username} with ID: ${user.id}`);
          } else {
            console.log(`User ${userData.username} already exists`);
          }
        }

        // Update the counter
        await set(ref(database, 'counters/userId'), this.userIdCounter);
        console.log('Sample data initialization completed');
        
        // Verify the data was created
        const verifySnapshot = await get(usersRef);
        const finalUserCount = Object.keys(verifySnapshot.val() || {}).length;
        console.log(`Final user count: ${finalUserCount}`);
      } else {
        console.log('Sample data already complete with 5+ users');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  private async updateCounters() {
    const userCounterRef = ref(database, 'counters/userId');
    const postCounterRef = ref(database, 'counters/postId');

    const userCounterSnapshot = await get(userCounterRef);
    const postCounterSnapshot = await get(postCounterRef);

    this.userIdCounter = userCounterSnapshot.exists() ? userCounterSnapshot.val() : 1;
    this.postIdCounter = postCounterSnapshot.exists() ? postCounterSnapshot.val() : 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    const userRef = ref(database, `communityUsers/${id}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersRef = ref(database, 'communityUsers');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const userEntry = Object.entries(users).find(([_, user]: [string, any]) => user.username === username);
      return userEntry ? userEntry[1] as User : undefined;
    }

    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.updateCounters();

    const id = this.userIdCounter++;
    const user: User = {
      id,
      username: insertUser.username,
      bio: insertUser.bio || "",
      avatar: insertUser.avatar || "1",
      score: 0,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    };

    await set(ref(database, `communityUsers/${id}`), user);
    await set(ref(database, 'counters/userId'), this.userIdCounter);

    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...updateUser,
    };

    await set(ref(database, `communityUsers/${id}`), updatedUser);
    return updatedUser;
  }

  async getLeaderboard(): Promise<User[]> {
    await this.ensureInitialized();
    
    const usersRef = ref(database, 'communityUsers');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const leaderboard = Object.values(users)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 20) as User[];
      
      console.log(`Returning leaderboard with ${leaderboard.length} users`);
      return leaderboard;
    }

    console.log('No users found in Firebase for leaderboard');
    return [];
  }

  async createPost(userId: number, insertPost: InsertPost): Promise<Post> {
    await this.updateCounters();

    const id = this.postIdCounter++;
    const post: Post = {
      id,
      userId,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      likes: 0,
      comments: 0,
      score: 0,
      createdAt: new Date(),
    };

    await set(ref(database, `posts/${id}`), {
      ...post,
      createdAt: post.createdAt.toISOString(),
    });
    await set(ref(database, `postLikes/${id}`), {});
    await set(ref(database, 'counters/postId'), this.postIdCounter);

    // Update user's post count
    const user = await this.getUser(userId);
    if (user) {
      user.postsCount += 1;
      await set(ref(database, `communityUsers/${userId}`), user);
    }

    return post;
  }

  async getPosts(): Promise<PostWithUser[]> {
    const postsRef = ref(database, 'posts');
    const usersRef = ref(database, 'communityUsers');

    const [postsSnapshot, usersSnapshot] = await Promise.all([
      get(postsRef),
      get(usersRef)
    ]);

    if (!postsSnapshot.exists() || !usersSnapshot.exists()) {
      return [];
    }

    const posts = postsSnapshot.val();
    const users = usersSnapshot.val();

    const postsArray = Object.values(posts).map((post: any) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    })) as Post[];

    const sortedPosts = postsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sortedPosts.map(post => ({
      ...post,
      user: users[post.userId],
    }));
  }

  async getUserPosts(userId: number): Promise<PostWithUser[]> {
    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const posts = snapshot.val();
    const user = await this.getUser(userId);

    if (!user) {
      return [];
    }

    const userPosts = Object.values(posts)
      .filter((post: any) => post.userId === userId)
      .map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      })) as Post[];

    const sortedPosts = userPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sortedPosts.map(post => ({
      ...post,
      user,
    }));
  }

  async likePost(postId: number, userId: number): Promise<Post | undefined> {
    const postRef = ref(database, `posts/${postId}`);
    const likesRef = ref(database, `postLikes/${postId}/${userId}`);

    const [postSnapshot, likeSnapshot] = await Promise.all([
      get(postRef),
      get(likesRef)
    ]);

    if (!postSnapshot.exists()) return undefined;

    const post = {
      ...postSnapshot.val(),
      createdAt: new Date(postSnapshot.val().createdAt),
    } as Post;

    const isLiked = likeSnapshot.exists();

    if (isLiked) {
      // Unlike
      await set(likesRef, null);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      await set(likesRef, true);
      post.likes += 1;

      // Award points for engagement
      await this.incrementPostScore(postId, 1);
      await this.incrementUserScore(post.userId, 1);
    }

    await set(postRef, {
      ...post,
      createdAt: post.createdAt.toISOString(),
    });

    return post;
  }

  async incrementPostScore(postId: number, points: number): Promise<void> {
    const postRef = ref(database, `posts/${postId}`);
    const snapshot = await get(postRef);

    if (snapshot.exists()) {
      const post = snapshot.val();
      post.score += points;
      await set(postRef, post);
    }
  }

  async incrementUserScore(userId: number, points: number): Promise<void> {
    const userRef = ref(database, `communityUsers/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const user = snapshot.val();
      user.score += points;
      await set(userRef, user);
    }
  }
}

export const storage = new FirebaseStorage();