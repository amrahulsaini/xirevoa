import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if email exists
      const [existingEmails] = await connection.query<User[]>(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingEmails.length > 0) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Check if username exists
      const [existingUsernames] = await connection.query<User[]>(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );

      if (existingUsernames.length > 0) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user
      await connection.query(
        `INSERT INTO users (username, email, password, verification_token, email_verified, coins) 
         VALUES (?, ?, ?, ?, FALSE, 250)`,
        [username, email, hashedPassword, verificationToken]
      );

      // Send verification email
      await sendVerificationEmail(email, verificationToken, username);

      return NextResponse.json(
        { message: "Account created! Check your email to verify." },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
