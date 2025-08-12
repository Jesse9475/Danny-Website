import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // In a real application, you would:
    // 1. Hash the password and compare with database
    // 2. Use proper authentication like NextAuth.js
    // 3. Generate a proper JWT token
    
    // For demo purposes, using hardcoded credentials
    if (email === 'admin@autohaus.com' && password === 'admin123') {
      // Generate a simple token (in production, use proper JWT)
      const token = 'admin-token-' + Date.now();
      
      return NextResponse.json({
        success: true,
        token: token,
        user: {
          email: email,
          name: 'Admin User',
          role: 'admin'
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}