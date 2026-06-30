import { sql } from '@vercel/postgres';

export interface BrainLog {
  timestamp: string;
  type: 'ai' | 'obsidian' | 'voice';
  message: string;
  output?: string;
}

export async function initLogger() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS brain_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        output TEXT
      );
    `;
    // Attempt to add output column if it doesn't exist
    try {
      await sql`ALTER TABLE brain_logs ADD COLUMN IF NOT EXISTS output TEXT;`;
    } catch {}
  } catch (err) {
    console.error('Failed to initialize database logger', err);
  }
}

export async function logBrainActivity(type: BrainLog['type'], message: string, output?: string) {
  try {
    // Basic in-memory fallback if SQL fails or is not configured
    if (!process.env.POSTGRES_URL) {
      const logs = (global as any).brainLogs || [];
      logs.unshift({ timestamp: new Date().toISOString(), type, message, output });
      (global as any).brainLogs = logs.slice(0, 50);
      return;
    }

    await sql`
      INSERT INTO brain_logs (type, message, output)
      VALUES (${type}, ${message}, ${output || null});
    `;
  } catch (err) {
    console.error('Logging to DB failed, falling back to memory', err);
    // Fallback logic
    const logs = (global as any).brainLogs || [];
    logs.unshift({ timestamp: new Date().toISOString(), type, message, output });
    (global as any).brainLogs = logs.slice(0, 50);
  }
}

export async function getBrainLogs(): Promise<BrainLog[]> {
  try {
    if (!process.env.POSTGRES_URL) {
      return (global as any).brainLogs || [];
    }

    const { rows } = await sql`
      SELECT timestamp::text, type, message, output
      FROM brain_logs
      ORDER BY timestamp DESC
      LIMIT 50;
    `;
    return rows as BrainLog[];
  } catch (err) {
    console.error('Fetching logs from DB failed', err);
    return (global as any).brainLogs || [];
  }
}
