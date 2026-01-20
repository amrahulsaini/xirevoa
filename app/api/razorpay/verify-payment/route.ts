import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      xp,
      planName,
      amount,
    } = await req.json();

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay to get status
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    // Payment verified successfully, update user's XP
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update user's XP
      await connection.query(
        "UPDATE users SET xpoints = xpoints + ? WHERE email = ?",
        [xp, session.user.email]
      );

      // Get updated XP balance
      const [userRows]: any = await connection.query(
        "SELECT xpoints FROM users WHERE email = ?",
        [session.user.email]
      );

      const newBalance = userRows[0]?.xpoints || 0;

      // Log transaction (optional - create a transactions table if needed)
      // You can add transaction logging here if you want to keep records

      await connection.commit();

      // Create invoice via Razorpay
      try {
        const invoice = await razorpay.invoices.create({
          type: "invoice",
          description: `${planName} - ${xp} XP Points Purchase`,
          customer: {
            name: session.user.name || session.user.email?.split('@')[0] || "Customer",
            email: session.user.email,
          },
          line_items: [
            {
              name: `${planName} Plan`,
              description: `${xp} XP Points for AI Image Generation`,
              amount: amount * 100, // Amount in paise
              currency: "INR",
              quantity: 1,
            },
          ],
          currency: "INR",
          email_notify: 1, // Razorpay will email the invoice automatically
          sms_notify: 0,
          date: Math.floor(Date.now() / 1000), // Current timestamp
          expire_by: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days expiry
        });

        console.log("Invoice created:", invoice.id);
      } catch (invoiceError) {
        // Don't fail the payment if invoice creation fails
        console.error("Invoice creation error:", invoiceError);
      }

      return NextResponse.json({
        success: true,
        message: "Payment successful! XP added to your account.",
        xpAdded: xp,
        newBalance: newBalance,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } catch (dbError) {
      await connection.rollback();
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update XP balance" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
