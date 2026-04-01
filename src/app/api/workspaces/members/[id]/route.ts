import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

const getUserId = (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

// DELETE: Remove a member from the workspace (Owner only)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memberIdToRemove = params.id;
    if (userId === memberIdToRemove) {
      return NextResponse.json({ error: 'You cannot remove yourself. Use "Leave Team" instead.' }, { status: 400 });
    }

    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');

    // Find workspace owned by this user
    const workspace = await db.collection('workspaces').findOne({ 
      ownerId: new mongoose.Types.ObjectId(userId) 
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Only workspace owners can remove members.' }, { status: 403 });
    }

    // Use $pull to avoid Mongoose re-validating all members (bypasses legacy data issues)
    await db.collection('workspaces').updateOne(
      { _id: workspace._id },
      { $pull: { members: { userId: new mongoose.Types.ObjectId(memberIdToRemove) } } } as any
    );

    // Clear the removed user's currentWorkspace if it was this workspace
    const removedUser = await User.findById(memberIdToRemove);
    if (removedUser && removedUser.currentWorkspace?.toString() === workspace._id.toString()) {
      await User.findByIdAndUpdate(memberIdToRemove, { $unset: { currentWorkspace: "" } });
    }

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Remove Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
