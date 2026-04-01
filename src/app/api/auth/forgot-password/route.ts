import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    // Secure neutral response to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with that email, a reset link has been sent.' }, 
        { status: 200 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store in DB with 30 min expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // Send email with plain token (user will click this)
    await sendResetPasswordEmail(email, resetToken);

    return NextResponse.json(
      { message: 'If an account exists with that email, a reset link has been sent.' }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
