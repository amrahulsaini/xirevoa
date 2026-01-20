import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./db";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string | null;
  profile_picture: string | null;
  provider: string;
  email_verified: boolean;
  xpoints: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const connection = await pool.getConnection();
        try {
          const [users] = await connection.query<User[]>(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
          );

          if (users.length === 0) {
            throw new Error("No user found with this email");
          }

          const user = users[0];

          if (!user.password) {
            throw new Error("Please sign in with Google");
          }

          if (!user.email_verified) {
            throw new Error("Please verify your email first");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            image: user.profile_picture,
            xpoints: user.xpoints,
          };
        } finally {
          connection.release();
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const connection = await pool.getConnection();
        try {
          // Check if user exists
          const [existingUsers] = await connection.query<User[]>(
            "SELECT * FROM users WHERE email = ?",
            [user.email]
          );

          if (existingUsers.length === 0) {
            // Create username from email
            const emailUsername = user.email?.split("@")[0] || "user";
            let username = emailUsername;
            let counter = 1;

            // Check if username exists and make it unique
            while (true) {
              const [usernameCheck] = await connection.query<User[]>(
                "SELECT id FROM users WHERE username = ?",
                [username]
              );

              if (usernameCheck.length === 0) break;
              username = `${emailUsername}${counter}`;
              counter++;
            }

            // Create new user
            await connection.query(
              `INSERT INTO users (username, email, provider, provider_id, profile_picture, email_verified, xpoints) 
               VALUES (?, ?, 'google', ?, ?, TRUE, 20)`,
              [username, user.email, account.providerAccountId, user.image]
            );
          } else {
            // User exists (created with email/password before)
            // Link Google account by updating profile picture, provider info, and verify email
            await connection.query(
              `UPDATE users 
               SET profile_picture = ?, provider = 'google', provider_id = ?, email_verified = TRUE 
               WHERE email = ?`,
              [user.image, account.providerAccountId, user.email]
            );
          }
        } finally {
          connection.release();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Fetch latest user data including xpoints, username, and profile picture
      if (token.email) {
        const connection = await pool.getConnection();
        try {
          const [users] = await connection.query<User[]>(
            "SELECT id, username, email, profile_picture, xpoints FROM users WHERE email = ?",
            [token.email]
          );
          
          if (users.length > 0) {
            token.id = users[0].id.toString();
            token.name = users[0].username;
            token.username = users[0].username;
            token.picture = users[0].profile_picture;
            token.profilePicture = users[0].profile_picture;
            token.xpoints = users[0].xpoints;
          }
        } finally {
          connection.release();
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.xpoints = token.xpoints as number;
        session.user.username = token.username as string;
        session.user.profilePicture = token.profilePicture as string | null;
        session.user.image = token.profilePicture as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
