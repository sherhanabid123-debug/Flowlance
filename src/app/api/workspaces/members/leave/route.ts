import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { Workspace } from '@/models/Workspace';
import { User } from '@/models/User';
import { getServerSession } from '@/lib/permissions';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const workspace = await Workspace.findById(session.workspaceId);
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    // Owners cannot leave — they must promote someone or delete the workspace.
    if (session.role === 'owner') {
      return NextResponse.json({ 
        error: 'As the Workspace Owner, you cannot leave. Please promote another member to Owner first.' 
      }, { status: 403 });
    }

    // Use direct $pull to avoid Mongoose re-validating all members in the array
    // This bypasses the validation error on legacy members with inconsistent casing
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');

    await db.collection('workspaces').updateOne(
      { _id: new mongoose.Types.ObjectId(session.workspaceId) },
      { $pull: { members: { userId: new mongoose.Types.ObjectId(session.userId) } } } as any
    );

    // Clear user's currentWorkspace reference
    await User.findByIdAndUpdate(session.userId, { 
      $unset: { currentWorkspace: "" } 
    });

    return NextResponse.json({ message: 'Left workspace successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Leave Workspace Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
