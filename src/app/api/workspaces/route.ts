import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

const getUserId = (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has no workspace selected, try to find one they belong to
    if (!user.currentWorkspace) {
      const workspace = await Workspace.findOne({
        $or: [
          { ownerId: userId },
          { 'members.userId': userId }
        ]
      });
      if (workspace) {
        user.currentWorkspace = workspace._id;
        await user.save();
      } else {
        return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }
    }

    // Find workspace and populate all needed fields
    const workspace = await Workspace.findById(user.currentWorkspace)
      .populate('members.userId', 'name email avatar userType')
      .populate('ownerId', 'name email avatar userType'); // Added avatar and userType

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // SECURITY: Verify user is still a member or owner of this workspace
    // After population, ownerId._id is the ID. If not populated, ownerId is the ID.
    const ownerId = (workspace.ownerId as any)._id?.toString() || workspace.ownerId.toString();
    const isOwner = ownerId === userId;
    const isMember = workspace.members.some(m => m.userId?._id?.toString() === userId || m.userId?.toString() === userId);

    if (!isOwner && !isMember) {
      user.currentWorkspace = undefined;
      await user.save();
      return NextResponse.json({ error: 'Access denied. You are no longer a member of this workspace.' }, { status: 403 });
    }

    return NextResponse.json({ workspace }, { status: 200 });
  } catch (error: any) {
    console.error('Workspace Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
