import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import { verifyToken } from '@/lib/auth';
import { sendTeamInviteEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const token = cookies.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the workspace where the user is an owner
    // Note: We'll assume the user is inviting to their primary workspace for now
    // In a multi-workspace system, we'd pass workspaceId as well.
    const workspace = await Workspace.findOne({ 
      $or: [
        { ownerId: decoded.userId },
        { 'members': { $elemMatch: { userId: decoded.userId, role: 'owner' } } }
      ]
    }).populate('ownerId', 'name');

    if (!workspace) {
      return NextResponse.json({ error: 'No workspace found or insufficient permissions' }, { status: 404 });
    }

    // 2. Generate or refresh invite token if expired
    let inviteToken = workspace.inviteToken;
    if (!inviteToken || !workspace.inviteTokenExpires || workspace.inviteTokenExpires < new Date()) {
      inviteToken = crypto.randomBytes(32).toString('hex');
      workspace.inviteToken = inviteToken;
      workspace.inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await workspace.save();
    }

    // 3. Send Email
    const inviterName = (workspace.ownerId as any).name || 'Your Team Leader';
    const emailSent = await sendTeamInviteEmail(email, inviterName, workspace.name, inviteToken!);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitation sent successfully' });

  } catch (error: any) {
    console.error('Email Invite Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
