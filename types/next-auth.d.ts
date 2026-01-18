import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      coins: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    coins: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    coins: number;
  }
}
