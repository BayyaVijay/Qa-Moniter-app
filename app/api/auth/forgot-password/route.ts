import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address is required',
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No account found with this email address',
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is deactivated. Please contact administrator.',
        },
        { status: 401 }
      );
    }

    // Generate a temporary token for password reset (valid for 1 hour)
    const resetToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // In a real application, you would send this token via email
    // For this implementation, we'll return it directly
    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email',
      resetToken, // In production, this should be sent via email
      data: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process forgot password request',
      },
      { status: 500 }
    );
  }
}