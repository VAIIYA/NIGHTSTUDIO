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

interface IndexConfig {
  collection: string;
  index: Record<string, any>;
  options?: Record<string, any>;
}

/**
 * Initialize database indexes - call this once during app startup
 */
export async function initializeDatabase(): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  const indexes: IndexConfig[] = [
    // Posts collection indexes
    { collection: "posts", index: { createdAt: -1 } },
    { collection: "posts", index: { author: 1, createdAt: -1 } },
    { collection: "posts", index: { id: 1 }, options: { unique: true } },
    { collection: "posts", index: { content: 'text' } },

    // Profiles collection indexes
    { collection: "profiles", index: { wallet: 1 }, options: { unique: true } },
    { collection: "profiles", index: { username: 1 }, options: { sparse: true, unique: true } },
    { collection: "profiles", index: { displayName: 'text', bio: 'text' } },

    // Likes collection indexes
    { collection: "likes", index: { postId: 1, wallet: 1 }, options: { unique: true } },
    { collection: "likes", index: { wallet: 1, createdAt: -1 } },

    // Comments collection indexes
    { collection: "comments", index: { postId: 1, createdAt: -1 } },
    { collection: "comments", index: { author: 1, createdAt: -1 } },
    { collection: "comments", index: { content: 'text' } },

    // Follows collection indexes
    { collection: "follows", index: { follower: 1, following: 1 }, options: { unique: true } },
    { collection: "follows", index: { following: 1, createdAt: -1 } },

    // Subscriptions collection indexes
    { collection: "subscriptions", index: { subscriber: 1, creator: 1 }, options: { unique: true } },
    { collection: "subscriptions", index: { creator: 1, createdAt: -1 } },

    // Notifications collection indexes
    { collection: "notifications", index: { recipient: 1, createdAt: -1 } },
    { collection: "notifications", index: { recipient: 1, read: 1, createdAt: -1 } },

    // Reports collection indexes
    { collection: "reports", index: { reportedUser: 1, createdAt: -1 } },
    { collection: "reports", index: { status: 1, createdAt: -1 } },

    // Unlocks collection indexes
    { collection: "unlocks", index: { postId: 1, wallet: 1 } },
    { collection: "unlocks", index: { postId: 1 } },
    { collection: "unlocks", index: { wallet: 1 } },
  ];

  console.log('Initializing database indexes...');

  for (const { collection, index, options } of indexes) {
    try {
      await db.collection(collection).createIndex(index, options);
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.warn(`Failed to create index on ${collection}:`, error.message);
      }
    }
  }

  console.log('Database indexes initialized');
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}
