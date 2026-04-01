import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();
    
    // Safety check: but for this context we allow it once.
    const workspaces = await Workspace.find({});
    let migratedCount = 0;
    
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');
    
    for (const workspace of workspaces) {
      // Check if it's already in the and new format
      const hasOldFormat = workspace.members.some(m => !(m as any).userId);
      
      if (hasOldFormat || workspace.members.length === 0) {
        // We handle it in the DB directly to avoid Mongoose schema validation errors
        // of old vs new members during migration
        const rawWorkspace = await db.collection('workspaces').findOne({ _id: workspace._id });
        if (!rawWorkspace) continue;

        const oldMembers: mongoose.Types.ObjectId[] = rawWorkspace.members || [];
        
        // Convert old members (ObjectId array) to new objects { userId, role }
        const newMembers = oldMembers.map((mId: any) => ({
          userId: mId,
          role: mId.toString() === workspace.ownerId.toString() ? 'owner' : 'member'
        }));

        // Ensure owner is always in the members list as an owner role if they weren't before
        const isOwnerInMembers = newMembers.some(m => m.userId.toString() === workspace.ownerId.toString());
        if (!isOwnerInMembers) {
          newMembers.push({
            userId: workspace.ownerId as mongoose.Types.ObjectId,
            role: 'owner'
          });
        }

        await db.collection('workspaces').updateOne(
          { _id: workspace._id },
          { $set: { members: newMembers } }
        );
        migratedCount++;
      }
    }
    
    return NextResponse.json({ message: `Successfully migrated ${migratedCount} workspaces to RBAC.` }, { status: 200 });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
