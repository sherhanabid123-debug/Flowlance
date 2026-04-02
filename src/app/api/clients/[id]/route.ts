import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getServerSession } from '@/lib/permissions';
import { addDays } from 'date-fns';

const FINANCIAL_FIELDS = ['expectedBudget', 'advanceAmount', 'totalAmount', 'finalAmount'];

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  return PUT(req, props);
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const data = await req.json();
    
    // RBAC: Check for financial field updates in member role
    if (session.role !== 'owner') {
      const attemptedFinancialChanges = Object.keys(data).filter(key => FINANCIAL_FIELDS.includes(key));
      if (attemptedFinancialChanges.length > 0) {
        return NextResponse.json({ 
          error: 'Access denied. Workspace members cannot edit financial information (budgets/amounts).' 
        }, { status: 403 });
      }
    }
    
    // Recalculate follow-up if manually updated
    if (data.status !== 'completed' && (data.lastFollowUp || data.followUpInterval)) {
      const existing = await Client.findOne({ _id: params.id, workspaceId: session.workspaceId });
      if (existing) {
        const interval = data.followUpInterval || existing.followUpInterval || 3;
        const lastDate = data.lastFollowUp ? new Date(data.lastFollowUp) : new Date(existing.lastFollowUp || Date.now());
        data.nextFollowUp = addDays(lastDate, interval);
      }
    }
    
    const updatedClient = await Client.findOneAndUpdate(
      { _id: params.id, workspaceId: session.workspaceId },
      { ...data, shares: data.shares }, // Force shares field even if it's in spread
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
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // RBAC: Only owners can delete clients
    if (session.role !== 'owner') {
      return NextResponse.json({ error: 'Access denied. Only workspace owners can delete clients.' }, { status: 403 });
    }

    await dbConnect();
    const deletedClient = await Client.findOneAndDelete({ _id: params.id, workspaceId: session.workspaceId });
    
    if (!deletedClient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
