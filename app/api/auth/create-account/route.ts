import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, email, oldPassword, newPassword, role = 'tester' } = body;

    // Validation
    if (!name || !email || !oldPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required',
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

    if (oldPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be different from the old password',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      );
    }

    // Create new user with the new password
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: newPassword, // This will be hashed by the pre-save middleware
      role,
    });

    const savedUser = await user.save();

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
      },
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Error creating account:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create account',
      },
      { status: 500 }
    );
  }
}