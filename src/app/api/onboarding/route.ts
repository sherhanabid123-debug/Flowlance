import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Workspace } from '@/models/Workspace';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const token = cookies.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { name, type, companyName } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Create the workspace name
    const workspaceName = type === 'agency' ? (companyName || `${name}'s Agency`) : `${name}'s Workspace`;

    // 2. Create the new workspace
    const workspace = await Workspace.create({
      name: workspaceName,
      ownerId: user._id,
      members: [{ userId: user._id, role: 'owner' }],
    });

    // 3. Update the user profile
    user.name = name;
    user.userType = type;
    if (type === 'agency' && companyName) {
      user.agencyName = companyName;
    }
    user.currentWorkspace = workspace._id as any;
    await user.save();

    return NextResponse.json({ 
      message: 'Onboarding complete', 
      workspaceId: workspace._id,
      user: {
        name: user.name,
        userType: user.userType,
        currentWorkspace: user.currentWorkspace
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
