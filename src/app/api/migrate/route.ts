import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Workspace } from '@/models/Workspace';
import { Client } from '@/models/Client';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();
    
    // Safety check: ensure only admins can run this, but for this context we allow it once.
    // In a real prod environment, you'd secure this route heavily.
    
    const users = await User.find({});
    let migratedCount = 0;
    
    for (const user of users) {
      if (!user.currentWorkspace) {
        // Create default workspace
        const workspaceName = user.name ? `${user.name}'s Workspace` : 'My Workspace';
        
        const newWorkspace = await Workspace.create({
          name: workspaceName,
          ownerId: user._id,
          members: [user._id],
        });
        
        // Update user
        user.currentWorkspace = newWorkspace._id as mongoose.Types.ObjectId;
        await user.save();
        
        // Update clients - using direct db connection to bypass schema validation
        // since we renamed userId to workspaceId in the schema, the DB documents still have userId
        const db = mongoose.connection.db;
        if (db) {
          await db.collection('clients').updateMany(
            { userId: user._id },
            { $set: { workspaceId: newWorkspace._id }, $unset: { userId: "" } }
          );
        }
        
        migratedCount++;
      }
    }
    
    return NextResponse.json({ message: `Successfully migrated ${migratedCount} users to workspaces.` }, { status: 200 });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
