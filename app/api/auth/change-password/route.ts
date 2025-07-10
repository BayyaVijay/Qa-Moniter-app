import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validation
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Old password and new password are required',
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

    // Find user by ID
    const user = await User.findById(userPayload.userId);
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

    // Verify old password
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password is incorrect',
        },
        { status: 400 }
      );
    }

    // Check if new password is different from old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be different from current password',
        },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to change password',
      },
      { status: 500 }
    );
  }
}