import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Workspace } from '@/models/Workspace';
import { Client } from '@/models/Client';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: Request) {
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

    await dbConnect();

    const userId = decoded.userId;

    // 1. Find all workspaces where the user is the owner
    const ownedWorkspaces = await Workspace.find({ ownerId: userId });
    const ownedWorkspaceIds = ownedWorkspaces.map(w => w._id);

    // 2. Delete all clients in those owned workspaces
    if (ownedWorkspaceIds.length > 0) {
      await Client.deleteMany({ workspaceId: { $in: ownedWorkspaceIds } });
    }

    // 3. Delete the owned workspaces
    if (ownedWorkspaceIds.length > 0) {
      await Workspace.deleteMany({ _id: { $in: ownedWorkspaceIds } });
    }

    // 4. Remove the user from any other workspaces as a member
    await Workspace.updateMany(
      { 'members.userId': userId },
      { $pull: { members: { userId: userId } } }
    );

    // 5. Delete the User account
    await User.findByIdAndDelete(userId);

    // 6. Clear auth cookie
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.headers.set('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

    return response;

  } catch (error: any) {
    console.error('Account Deletion Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
