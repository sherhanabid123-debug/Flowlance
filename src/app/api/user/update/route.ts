import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const tokenCookie = cookieHeader?.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, email, userType, agencyName } = await req.json();

    if (!name && !email && !userType && agencyName === undefined) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    await dbConnect();

    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.userId } });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        ...(name && { name }), 
        ...(email && { email }),
        ...(userType && { userType }),
        ...(agencyName !== undefined && { agencyName })
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
