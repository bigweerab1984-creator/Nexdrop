import { executeTool } from './lib/tools';

async function test() {
  const res = await executeTool({ tool: 'list_files', path: '.' });
  console.log('List files:', res);

  const res2 = await executeTool({ tool: 'read_file', path: 'package.json' });
  console.log('Read package.json:', res2.content ? 'Success' : 'Fail');
}

test();
