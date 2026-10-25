# Flows through MCP

Agents build and run flows with the same rules as the Flows page. The app, the dev server's Assistant and a standalone `npx comfyfield mcp` all read and write one file.

## Storage

- Flows live in `.comfyfield/flows.json` under `COMFYFIELD_HOME` (default: the working directory). The file holds `revision`, `flows`, `current` and `runs` (run state per flow: outputs and gate status).
- Every write bumps `revision`. The server refuses a save with an old revision ("Flows changed elsewhere. Reload flows before editing again."). The app does not show that to the user: it merges and saves again (see below).
- Node media is a URL (for example `/media/...` from the Library or an upload), not inline file data. Flows made before uploads went through `/api/upload` can still hold data URLs until the image is uploaded again.
- `server/flows.js` owns storage, validation and runs. `shared/flowRules.js` holds the node types, defaults and connection rule, so the canvas and MCP refuse the same things for the same reason.

## Moving flows out of the browser

Flows used to live in this browser's `localStorage` (`comfyfield.flows`, `comfyfield.flowrun.<id>`). The first time the Flows page loads, it adds every non-empty browser flow the server does not have yet, with its finished results, then sets `comfyfield.flows.migrated`. A server flow with the same id always wins. The browser copy is not deleted, so it stays as a fallback.

## How the app sees agent changes

- Every write to `flows.json` becomes a `flows` event on the `/api/agents/events` stream (server-sent events). Writes by the Assistant are sent at once. A standalone MCP server is another process, so the dev server polls the file and sends an event for its writes too, within about half a second.
- On an event the page fetches the flows and shows them at once, also while it has unsaved edits of its own.
- Conflicts are last write wins per node (`shared/flowMerge.js`). What the page changed since the flows it last got goes on top of the new flows: a node, an edge, the flow name, an added or removed flow. Every node the page did not touch comes from the server as it is. When both sides changed the same node, the later save keeps that whole node.
- When a save meets an old revision, the page merges the same way and saves again, so two writers do not overwrite each other's nodes.
- Selection and measured node sizes stay in the page. They are never saved, so a remote change does not clear what the user selected.

Checks: `node scripts/flow-sync-checks.mjs`.

## Agents on the canvas

- Every MCP session joins a shared roster in `.comfyfield/agents.json` (`server/presence.js`): the Assistant inside the app and every terminal running `npx comfyfield mcp`. Each one gets a name, "Agent 1", "Agent 2" and so on (the lowest number no live agent has), and the color token of that number, `--agent-1` to `--agent-6`. Set `COMFYFIELD_AGENT_NAME="Agent 3"` before starting a terminal server to keep a fixed name and color.
- Flow tools that change a node (`create_flow`, `add_node`, `connect_nodes`, `update_node`, `remove_node`, `run_flow`) move the caller's cursor to that node. The canvas animates the cursor there and shows a badge on the node, such as "Agent 2 is working on this". Reading tools do not move it.
- An Assistant session works until its turn ends. A terminal session has no turns, so it counts as working for 8 seconds after its last flow tool. Then the cursor and badge fade out.
- A terminal session leaves the roster when it exits. If a terminal is closed without exiting, the next read of the roster drops it, because its process is gone.
- The app reads the roster from `GET /api/agents/presence` and gets an `agents` event on `/api/agents/events` when it changes.

Checks: `node scripts/agent-presence-checks.mjs`.

## Tools

| Tool | Input | What it does |
| --- | --- | --- |
| `list_flows` | none | Flow ids, names, node counts |
| `get_flow` | `flow_id` | Nodes, connections and run state |
| `create_flow` | `name`, optional `nodes`, `edges` | Makes a flow. Nodes may set their own `id` so edges can refer to them |
| `add_node` | `flow_id`, `type`, optional `id`, `position`, `data` | Adds a node with the canvas defaults. For a model node set `data.model` to a model id from `list_models` |
| `connect_nodes` | `flow_id`, `source`, `target` | Connects source's output to target's input |
| `update_node` | `flow_id`, `node_id`, optional `data`, `position` | Merges `data` into the node |
| `remove_node` | `flow_id`, `node_id` | Removes the node, its connections and its results |
| `run_flow` | `flow_id` | Run: fills gaps, spends credits, stops at gates |

Node types: `prompt`, `image`, `writer`, `mask`, `face`, `video`, `crop`, `model`, `stitch`, `approve`, `output`, `note`. Each node has at most one input and one output:

- No output: `output`, `note`.
- No input: `prompt`, `image`, `note`, `mask`, `face`, `video`, `crop`.
- A `prompt` only feeds a `model` or `writer`.
- No loops, no self connections, no duplicate connections.

Errors say what to fix, for example `Flow "Kites" has no node "q". Its node ids are: p, img.` or `Connecting Model node "vid" to Model node "img" would make a loop, because "img" already feeds "vid".`

## run_flow and the Flows rules

`run_flow` is the Run button. It runs only nodes without output, never re-runs a node that has output, and stops at every Approve gate and every Writer waiting for review. It returns `ran`, `outputs`, `failed`, `blocked`, `waiting_for_send` and `next`. When a gate waits, `next` tells the agent that the user must pick takes and press Send in Flows; no tool can Send. In the Assistant, `run_flow` also waits for the user to approve the cost plan.

Example: build and run a two-step flow.

```json
{ "name": "Kite to video",
  "nodes": [
    { "id": "p", "type": "prompt", "data": { "text": "A red kite over dunes at sunset" } },
    { "id": "img", "type": "model", "data": { "model": "comfy-flux", "takes": 2 } },
    { "id": "gate", "type": "approve" },
    { "id": "vid", "type": "model", "data": { "model": "comfy-ltx-i2v", "prompt": "Slow push in" } }
  ],
  "edges": [ { "source": "p", "target": "img" }, { "source": "img", "target": "gate" }, { "source": "gate", "target": "vid" } ] }
```

Checks: `node scripts/flow-mcp-checks.mjs` (mocked generation, no keys, no spend).
