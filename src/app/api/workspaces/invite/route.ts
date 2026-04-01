import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';
import mongoose from 'mongoose';

const getUserId = (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

// POST: Generate a new invite link
export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Find workspace where user is owner
    const workspace = await Workspace.findOne({ ownerId: userId });
    if (!workspace) return NextResponse.json({ error: 'Only owners can generate invites.' }, { status: 403 });

    // Generate secure token
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    workspace.inviteToken = inviteToken;
    workspace.inviteTokenExpires = inviteTokenExpires;
    await workspace.save();

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite?token=${inviteToken}`;
    return NextResponse.json({ inviteLink }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Accept an invite link
export async function PUT(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    await dbConnect();

    // Find workspace with valid token
    const workspace = await Workspace.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: Date.now() }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 400 });
    }

    // Add user to workspace if not already a member
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!workspace.members.find(m => m.toString() === userId)) {
      workspace.members.push(userObjectId as any);
      await workspace.save();
    }

    // Update user's currentWorkspace to this new one
    await User.findByIdAndUpdate(userId, { currentWorkspace: workspace._id });

    return NextResponse.json({ message: 'Successfully joined workspace', workspaceName: workspace.name }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
