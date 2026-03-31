import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { verifyToken } from '@/lib/auth';
import { addDays } from 'date-fns';

const getUserId = (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const data = await req.json();
    
    // Recalculate follow-up if manually updated
    if (data.status !== 'completed' && (data.lastFollowUp || data.followUpInterval)) {
      const existing = await Client.findOne({ _id: params.id, userId });
      if (existing) {
        const interval = data.followUpInterval || existing.followUpInterval || 3;
        const lastDate = data.lastFollowUp ? new Date(data.lastFollowUp) : new Date(existing.lastFollowUp || Date.now());
        data.nextFollowUp = addDays(lastDate, interval);
      }
    }
    
    const updatedClient = await Client.findOneAndUpdate(
      { _id: params.id, userId },
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
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const deletedClient = await Client.findOneAndDelete({ _id: params.id, userId });
    
    if (!deletedClient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
