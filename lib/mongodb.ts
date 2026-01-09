import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db();
  
  // Create comprehensive indexes for better query performance
  // These are idempotent - safe to call multiple times
  try {
    console.log('Creating database indexes...');

    // Posts collection indexes
    await db.collection("posts").createIndex({ createdAt: -1 });
    await db.collection("posts").createIndex({ author: 1, createdAt: -1 });
    await db.collection("posts").createIndex({ id: 1 }, { unique: true });
    await db.collection("posts").createIndex({ content: 'text' });

    // Profiles collection indexes
    await db.collection("profiles").createIndex({ wallet: 1 }, { unique: true });
    await db.collection("profiles").createIndex({ username: 1 }, { sparse: true, unique: true });
    await db.collection("profiles").createIndex({ displayName: 'text', bio: 'text' });

    // Likes collection indexes
    await db.collection("likes").createIndex({ postId: 1, wallet: 1 }, { unique: true });
    await db.collection("likes").createIndex({ wallet: 1, createdAt: -1 });

    // Comments collection indexes
    await db.collection("comments").createIndex({ postId: 1, createdAt: -1 });
    await db.collection("comments").createIndex({ author: 1, createdAt: -1 });
    await db.collection("comments").createIndex({ content: 'text' });

    // Follows collection indexes
    await db.collection("follows").createIndex({ follower: 1, following: 1 }, { unique: true });
    await db.collection("follows").createIndex({ following: 1, createdAt: -1 });

    // Subscriptions collection indexes
    await db.collection("subscriptions").createIndex({ subscriber: 1, creator: 1 }, { unique: true });
    await db.collection("subscriptions").createIndex({ creator: 1, createdAt: -1 });

    // Notifications collection indexes
    await db.collection("notifications").createIndex({ recipient: 1, createdAt: -1 });
    await db.collection("notifications").createIndex({ recipient: 1, read: 1, createdAt: -1 });

    // Reports collection indexes
    await db.collection("reports").createIndex({ reportedUser: 1, createdAt: -1 });
    await db.collection("reports").createIndex({ status: 1, createdAt: -1 });

    // Existing unlocks indexes
    await db.collection("unlocks").createIndex({ postId: 1, wallet: 1 });
    await db.collection("unlocks").createIndex({ postId: 1 });
    await db.collection("unlocks").createIndex({ wallet: 1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    // Indexes might already exist, ignore error
    console.log("Index creation note:", error instanceof Error ? error.message : "Unknown error");
  }
  
  return db;
}
