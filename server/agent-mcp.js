import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './mcp.js'

const [url, token] = process.argv.slice(2)
await createServer({
  invoke: async (name, args) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, args }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Session tool failed')
    return result
  },
}).connect(new StdioServerTransport())
