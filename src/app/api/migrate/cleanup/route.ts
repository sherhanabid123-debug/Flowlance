import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();
    
    const workspaces = await Workspace.find({});
    let totalFixed = 0;
    
    for (const workspace of workspaces) {
      let changed = false;
      const cleanMembers = [];
      
      for (const member of workspace.members) {
        if (!member) {
          changed = true;
          continue;
        }
        
        // If member is just an ObjectId, convert it to an object { userId, role }
        if (member instanceof mongoose.Types.ObjectId || typeof member === 'string') {
          cleanMembers.push({
            userId: new mongoose.Types.ObjectId(member),
            role: 'member'
          });
          changed = true;
        } else if ((member as any).userId) {
          // If it's already an object but needs verification
          cleanMembers.push(member);
        } else {
          // It's some other malformed object? Skip for safety
          changed = true;
        }
      }
      
      if (changed) {
        workspace.members = cleanMembers as any;
        await workspace.save();
        totalFixed++;
      }
    }
    
    return NextResponse.json({ message: `Successfully cleaned up ${totalFixed} workspaces with malformed member lists.` }, { status: 200 });
  } catch (error: any) {
    console.error('Data Cleanup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
