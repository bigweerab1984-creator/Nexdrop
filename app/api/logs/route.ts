import { NextRequest, NextResponse } from 'next/server';
import { getBrainLogs } from '@/lib/logger';

export async function GET() {
  return NextResponse.json(getBrainLogs());
}
