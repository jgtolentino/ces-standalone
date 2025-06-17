import { NextRequest, NextResponse } from 'next/server';
import { sendAlert } from '@/lib/alert';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, severity, message, metadata } = body;

    if (!service || !severity || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: service, severity, message' },
        { status: 400 }
      );
    }

    if (!['critical', 'error', 'warning', 'info'].includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be: critical, error, warning, or info' },
        { status: 400 }
      );
    }

    const success = await sendAlert({
      service,
      severity,
      message,
      metadata,
      timestamp: new Date().toISOString()
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Alert sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send alert' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing alert request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}