import { NextRequest, NextResponse } from 'next/server';
import { getBrainLogs, initLogger } from '@/lib/logger';

export async function GET() {
  await initLogger();
  const logs = await getBrainLogs();
  return NextResponse.json(logs);
}
