// Simple RAG implementation using keyword search for demonstration
// In a production app, use vector embeddings (e.g. OpenAI/Cohere) and a vector DB (e.g. Pinecone/pgvector)
import { sql } from '@vercel/postgres';

export async function indexNote(path: string, content: string) {
  try {
    if (!process.env.POSTGRES_URL) return;

    await sql`
      CREATE TABLE IF NOT EXISTS brain_memory (
        id SERIAL PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        indexed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      INSERT INTO brain_memory (path, content)
      VALUES (${path}, ${content})
      ON CONFLICT (path) DO UPDATE SET content = EXCLUDED.content, indexed_at = CURRENT_TIMESTAMP;
    `;
  } catch (err) {
    console.error('Failed to index note', err);
  }
}

export async function retrieveContext(query: string): Promise<string> {
  try {
    if (!process.env.POSTGRES_URL) return "";

    // Simple keyword search across memory
    const keywords = query.split(' ').filter(k => k.length > 3);
    if (keywords.length === 0) return "";

    const searchStr = `%${keywords.join('%')}%`;

    const { rows } = await sql`
      SELECT content, path FROM brain_memory
      WHERE content ILIKE ${searchStr}
      LIMIT 3;
    `;

    if (rows.length === 0) return "";

    return rows.map(r => `[From Obsidian Note: ${r.path}]\n${r.content}`).join('\n\n');
  } catch (err) {
    console.error('Failed to retrieve context', err);
    return "";
  }
}
