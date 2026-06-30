import { NextRequest, NextResponse } from 'next/server';
import { indexNote } from '@/lib/rag';
import { logBrainActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json(); // Array of { path, content }

    if (!Array.isArray(notes)) {
      return NextResponse.json({ error: 'Expected array of notes' }, { status: 400 });
    }

    logBrainActivity('obsidian', `Syncing ${notes.length} notes to long-term memory...`);

    for (const note of notes) {
      await indexNote(note.path, note.content);
    }

    return NextResponse.json({ success: true, count: notes.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
