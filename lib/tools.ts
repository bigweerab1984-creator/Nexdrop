import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function executeTool(toolCall: any) {
  const { tool, path: filePath, query } = toolCall;

  switch (tool) {
    case 'run_shell_command':
      try {
        const { command } = toolCall;
        const whitelist = ['npm ', 'ls', 'pwd', 'git ', 'cat ', 'grep ', 'find ', 'node ', 'bun '];
        const blacklist = ['rm ', 'sudo ', 'kill ', 'chmod ', 'chown ', 'apt ', 'shutdown', 'reboot', 'mv ', '..'];

        const isWhitelisted = whitelist.some(w => command.trim().startsWith(w));
        const isBlacklisted = blacklist.some(b => command.toLowerCase().includes(b));

        if (!isWhitelisted || isBlacklisted) {
          return { error: `Command blocked for security: ${command}. Only safe development commands are allowed.` };
        }

        const { stdout, stderr } = await execPromise(command, {
          cwd: process.cwd(),
          timeout: 60000,
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });
        return { stdout, stderr };
      } catch (err: any) {
        return { error: err.message, stderr: err.stderr, stdout: err.stdout };
      }

    case 'project_health':
      try {
        const { stdout: lintOut } = await execPromise('npm run lint', { cwd: process.cwd() }).catch(e => e);
        const { stdout: buildOut } = await execPromise('next build --debug', { cwd: process.cwd(), env: { ...process.env, CJ_API_KEY: 'mock', STRIPE_SECRET_KEY: 'mock' } }).catch(e => e);
        return {
          lint: lintOut?.includes('No issues found') ? 'Clean' : 'Issues detected',
          build: buildOut?.includes('First Load JS') ? 'Passing' : 'Failing',
          timestamp: new Date().toISOString()
        };
      } catch (err: any) {
        return { error: err.message };
      }

    case 'github_meta':
      try {
        const { stdout: remoteOut } = await execPromise('git remote -v', { cwd: process.cwd() });
        const { stdout: statusOut } = await execPromise('git status --short', { cwd: process.cwd() });
        const { stdout: logOut } = await execPromise('git log -n 5 --oneline', { cwd: process.cwd() });
        return {
          remote: remoteOut,
          status: statusOut,
          recent_commits: logOut
        };
      } catch (err: any) {
        return { error: err.message };
      }

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
