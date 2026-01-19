import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      xpoints: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    xpoints: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    xpoints: number;
  }
}
