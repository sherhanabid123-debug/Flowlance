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

// DELETE: Remove a member from the workspace (Owner only)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memberIdToRemove = params.id;
    if (userId === memberIdToRemove) {
      return NextResponse.json({ error: 'Owner cannot remove themselves. Delete workspace instead.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user || !user.currentWorkspace) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Check if requester is owner of their current workspace
    const workspace = await Workspace.findOne({ 
      _id: user.currentWorkspace, 
      ownerId: userId 
    });
    
    if (!workspace) {
      return NextResponse.json({ error: 'Only workspace owners can remove members.' }, { status: 403 });
    }

    // RBAC Fix: members is now an array of objects { userId, role }
    workspace.members = workspace.members.filter(m => m.userId.toString() !== memberIdToRemove);
    await workspace.save();

    // Clear the removed user's currentWorkspace if it was this one
    const removedUser = await User.findById(memberIdToRemove);
    if (removedUser && removedUser.currentWorkspace?.toString() === workspace._id.toString()) {
      removedUser.currentWorkspace = undefined;
      await removedUser.save();
    }

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
