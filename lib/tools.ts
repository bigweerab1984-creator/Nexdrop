import fs from 'fs/promises';
import path from 'path';

export async function executeTool(toolCall: any) {
  const { tool, path: filePath, query } = toolCall;

  switch (tool) {
    case 'read_file':
      try {
        const fullPath = path.join(process.cwd(), filePath);
        // Safety check: ensure path is within cwd
        if (!fullPath.startsWith(process.cwd())) {
          return { error: 'Access denied: Path outside project root' };
        }
        const content = await fs.readFile(fullPath, 'utf-8');
        return { content };
      } catch (err: any) {
        return { error: err.message };
      }

    case 'list_files':
      try {
        const fullPath = path.join(process.cwd(), filePath || '.');
        if (!fullPath.startsWith(process.cwd())) {
          return { error: 'Access denied: Path outside project root' };
        }
        const files = await fs.readdir(fullPath);
        return { files };
      } catch (err: any) {
        return { error: err.message };
      }

    case 'write_file':
      try {
        const { content: fileContent } = toolCall;
        const fullPath = path.join(process.cwd(), filePath);
        if (!fullPath.startsWith(process.cwd())) {
          return { error: 'Access denied: Path outside project root' };
        }
        // Ensure directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, fileContent, 'utf-8');
        return { success: true, path: filePath };
      } catch (err: any) {
        return { error: err.message };
      }

    case 'search_web':
      // Mock search for now
      return { results: [`Search results for "${query}": [Mock result 1], [Mock result 2]`] };

    default:
      return { error: `Unknown tool: ${tool}` };
  }
}
