import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

// ── MongoDB client for adapter ────────────────────────────────────────────────
const uri = process.env.MONGODB_URI as string;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// ── NextAuth config ───────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            if (process.env.NODE_ENV === "development") console.log("[auth] Missing credentials");
            return null;
          }

          await connectDB();

          // Fetch full document including password field
          // NOTE: do NOT use .select("+password") unless schema has select:false
          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          }).lean();

          if (process.env.NODE_ENV === "development") {
            console.log("[auth] User found:", !!user, "Has password:", !!(user as { password?: string })?.password);
          }

          if (!user) {
            if (process.env.NODE_ENV === "development") console.log("[auth] No user found for email:", credentials.email);
            return null;
          }

          const userDoc = user as { _id: { toString(): string }; email: string; name?: string; image?: string; password?: string };

          if (!userDoc.password) {
            console.log("[auth] User has no password (OAuth-only account)");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            userDoc.password
          );

          if (process.env.NODE_ENV === "development") console.log("[auth] Password valid:", isValid);

          if (!isValid) return null;

          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            name: userDoc.name ?? null,
            image: userDoc.image ?? null,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
