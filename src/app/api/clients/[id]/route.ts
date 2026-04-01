import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getWorkspaceId } from '@/lib/auth';
import { addDays } from 'date-fns';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Unauthorized: No assigned workspace' }, { status: 401 });

    await dbConnect();
    const data = await req.json();
    
    // Recalculate follow-up if manually updated
    if (data.status !== 'completed' && (data.lastFollowUp || data.followUpInterval)) {
      const existing = await Client.findOne({ _id: params.id, workspaceId });
      if (existing) {
        const interval = data.followUpInterval || existing.followUpInterval || 3;
        const lastDate = data.lastFollowUp ? new Date(data.lastFollowUp) : new Date(existing.lastFollowUp || Date.now());
        data.nextFollowUp = addDays(lastDate, interval);
      }
    }
    
    const updatedClient = await Client.findOneAndUpdate(
      { _id: params.id, workspaceId },
      data,
      { new: true }
    );
    
    if (!updatedClient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ client: updatedClient }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Unauthorized: No assigned workspace' }, { status: 401 });

    await dbConnect();
    const deletedClient = await Client.findOneAndDelete({ _id: params.id, workspaceId });
    
    if (!deletedClient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
