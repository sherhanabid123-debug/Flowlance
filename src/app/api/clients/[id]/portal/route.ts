import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getServerSession } from '@/lib/permissions';
import crypto from 'crypto';

// POST: Enable the client portal and (re)generate its share token
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const client = await Client.findOne({ _id: params.id, workspaceId: session.workspaceId });
    if (!client) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    // Reuse the existing token if one is already set, otherwise mint a new one
    const portalToken = client.portalToken || crypto.randomBytes(20).toString('hex');

    client.portalToken = portalToken;
    client.portalEnabled = true;
    await client.save();

    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${portalToken}`;
    return NextResponse.json({ client, portalLink }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Disable the client portal (invalidates the existing link)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const client = await Client.findOneAndUpdate(
      { _id: params.id, workspaceId: session.workspaceId },
      { portalEnabled: false },
      { new: true }
    );

    if (!client) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ client }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
