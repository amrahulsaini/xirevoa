import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  verification_token: string | null;
  email_verified: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/error?error=invalid_token", request.url));
    }

    const connection = await pool.getConnection();

    try {
      // Find user with this verification token
      const [users] = await connection.query<User[]>(
        "SELECT id, email, username, email_verified FROM users WHERE verification_token = ?",
        [token]
      );

      if (users.length === 0) {
        return NextResponse.redirect(new URL("/auth/error?error=invalid_token", request.url));
      }

      const user = users[0];

      if (user.email_verified) {
        return NextResponse.redirect(new URL("/auth/login?verified=already", request.url));
      }

      // Update user as verified
      await connection.query(
        "UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?",
        [user.id]
      );

      return NextResponse.redirect(new URL("/auth/login?verified=success", request.url));
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/error?error=server_error", request.url));
  }
}
