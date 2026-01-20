import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      xpoints: number;
      username: string;
      profilePicture?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    xpoints: number;
    username: string;
    profilePicture?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    xpoints: number;
    username: string;
    profilePicture?: string | null;
  }
}
