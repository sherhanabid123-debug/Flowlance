import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { Workspace } from '@/models/Workspace';

// GET: Public, read-only view of a client's project status.
// No authentication — access is gated purely by knowledge of the token,
// so only a deliberately minimal, non-financial set of fields is returned.
export async function GET(_req: Request, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    if (!token) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    await dbConnect();

    const client = await Client.findOne({ portalToken: token, portalEnabled: true }).lean();
    if (!client) return NextResponse.json({ error: 'This link is invalid or has been disabled.' }, { status: 404 });

    const workspace = await Workspace.findById(client.workspaceId).select('name').lean();

    return NextResponse.json({
      client: {
        name: client.name,
        projectName: client.projectName,
        status: client.status,
        notes: client.notes,
        startDate: client.startDate,
        completionDate: client.completionDate,
        sampleProvided: client.sampleProvided,
        sampleLink: client.sampleLink,
        nextFollowUp: client.status !== 'completed' ? client.nextFollowUp : undefined,
        createdAt: client.createdAt,
      },
      workspaceName: workspace?.name || 'Flowlance',
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
