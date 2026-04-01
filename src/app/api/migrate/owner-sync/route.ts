import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();
    
    const workspaces = await Workspace.find({});
    let updatedCount = 0;
    
    for (const workspace of workspaces) {
      // Ensure owner is in members array with role 'owner'
      const ownerIdStr = workspace.ownerId.toString();
      const ownerInMembers = workspace.members.find(m => m.userId.toString() === ownerIdStr);
      
      if (!ownerInMembers) {
        workspace.members.push({
          userId: workspace.ownerId as mongoose.Types.ObjectId,
          role: 'owner'
        } as any);
        await workspace.save();
        updatedCount++;
      } else if (ownerInMembers.role !== 'owner') {
        ownerInMembers.role = 'owner';
        await workspace.save();
        updatedCount++;
      }
    }
    
    return NextResponse.json({ message: `Successfully verified and updated ${updatedCount} workspaces to include owners in membership list.` }, { status: 200 });
  } catch (error: any) {
    console.error('Owner Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
