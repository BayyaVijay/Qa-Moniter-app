import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { resetToken, newPassword, confirmPassword } = body;

    // Validation
    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reset token, new password, and confirm password are required',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passwords do not match',
        },
        { status: 400 }
      );
    }

    // Verify the reset token
    const tokenPayload = verifyToken(resetToken);
    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token',
        },
        { status: 400 }
      );
    }

    // Find user by ID from token
    const user = await User.findById(tokenPayload.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is deactivated',
        },
        { status: 401 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}