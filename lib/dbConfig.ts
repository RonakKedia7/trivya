import mongoose from "mongoose";

declare global {
  var __mongooseConn: { promise: Promise<typeof mongoose> | null } | undefined;
}

/**
 * Reusable Mongo connection for Next.js (prevents hot-reload reconnection storms).
 * Throws on failure so API handlers can respond safely.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  // Already connected
  if (mongoose.connection.readyState === 1) return mongoose;

  // Reuse in-flight connection promise (important in dev / hot reload)
  if (!global.__mongooseConn) global.__mongooseConn = { promise: null };
  if (!global.__mongooseConn.promise) {
    global.__mongooseConn.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  await global.__mongooseConn.promise;
  return mongoose;
}
