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
    
    // 1. Get user and verify they have a current workspace
    const user = await User.findById(userId);
    if (!user || !user.currentWorkspace) {
      return NextResponse.json({ workspace: null }, { status: 200 });
    }

    // 2. Fetch workspace and populate members correctly
    // We populate members.userId to get the actual user details
    const workspace = await Workspace.findById(user.currentWorkspace)
      .populate('members.userId', 'name email avatar userType')
      .populate('ownerId', 'name email');

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // 3. Clean up the response: Remove members where the user no longer exists (e.g. deleted user)
    // and filter out entries that somehow failed to populate but remain as IDs
    const cleanedMembers = workspace.members.filter(m => m.userId && typeof m.userId === 'object');
    
    // Sort members: Owner first, then alphabetically
    const sortedMembers = [...cleanedMembers].sort((a, b) => {
      const isAOwner = (a.userId as any)._id.toString() === workspace.ownerId._id.toString();
      const isBOwner = (b.userId as any)._id.toString() === workspace.ownerId._id.toString();
      if (isAOwner && !isBOwner) return -1;
      if (!isAOwner && isBOwner) return 1;
      return (a.userId as any).name?.localeCompare((b.userId as any).name) || 0;
    });

    // We return a plain object to avoid Mongoose-specific issues with nested populate during JSON serialization
    const result = {
      ...workspace.toObject(),
      members: sortedMembers
    };

    return NextResponse.json({ workspace: result }, { status: 200 });
  } catch (error: any) {
    console.error('Workspaces GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
