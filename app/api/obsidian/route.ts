import { NextRequest, NextResponse } from 'next/server';

const OBSIDIAN_API_URL = process.env.OBSIDIAN_API_URL || 'http://127.0.0.1:27123';
const OBSIDIAN_API_KEY = process.env.OBSIDIAN_API_KEY || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  try {
    const url = path ? `${OBSIDIAN_API_URL}/vault/${path}` : `${OBSIDIAN_API_URL}/active`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${OBSIDIAN_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Obsidian API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { path, content, mode = 'overwrite' } = await req.json();

    if (!path || !content) {
      return NextResponse.json({ error: 'Path and content are required' }, { status: 400 });
    }

    const url = `${OBSIDIAN_API_URL}/vault/${path}`;
    let method = 'PUT';
    if (mode === 'append') method = 'POST';
    if (mode === 'patch') method = 'PATCH';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${OBSIDIAN_API_KEY}`,
        'Content-Type': 'text/markdown',
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Obsidian API returned ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
