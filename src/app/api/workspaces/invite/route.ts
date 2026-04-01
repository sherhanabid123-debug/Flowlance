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
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');

    // Find workspace where user is owner
    const workspace = await Workspace.findOne({ ownerId: userId });
    if (!workspace) return NextResponse.json({ error: 'Only owners can generate invites.' }, { status: 403 });

    // Generate secure token — use direct DB update to bypass .save() validation
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.collection('workspaces').updateOne(
      { _id: workspace._id },
      { $set: { inviteToken, inviteTokenExpires } }
    );

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
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');

    // Find workspace with valid token
    const workspace = await Workspace.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: Date.now() }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 400 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if already a member (handle both old format {userId} and any edge cases)
    const isAlreadyMember = workspace.members.some(m => {
      const mid = (m as any).userId || m;
      return mid.toString() === userId;
    });

    if (!isAlreadyMember) {
      // Use $push with the correct { userId, role } structure — bypass save() to avoid validation
      await db.collection('workspaces').updateOne(
        { _id: workspace._id },
        { $push: { members: { userId: userObjectId, role: 'member' } } } as any
      );
    }

    // Update user's currentWorkspace
    await User.findByIdAndUpdate(userId, { currentWorkspace: workspace._id });

    return NextResponse.json({ message: 'Successfully joined workspace', workspaceName: workspace.name }, { status: 200 });
  } catch (error: any) {
    console.error('Invite accept error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
