import { NextRequest, NextResponse } from 'next/server';
import { mintDalJwt } from '../../../../packages/agents/keykey/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('svc');
    
    // Only support DAL service for now
    if (service !== 'dal') {
      return NextResponse.json(
        { error: 'Unsupported service' },
        { status: 400 }
      );
    }
    
    // Mint a new JWT token for DAL access
    const token = await mintDalJwt();
    
    // Return just the token as plain text (for easy consumption)
    return new Response(token, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('KeyKey JWT mint error:', error);
    return NextResponse.json(
      { error: 'Failed to mint JWT token' },
      { status: 500 }
    );
  }
}