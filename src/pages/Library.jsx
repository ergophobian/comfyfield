import { useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import Generations from '../components/library/Generations.jsx'
import Assets from '../components/library/Assets.jsx'
import Voices from '../components/library/Voices.jsx'
import { WorkspaceScope } from '../components/nav/WorkspaceSwitcher.jsx'
import { useScope } from '../lib/workspaces.js'

const tabs = [
  { value: 'generations', label: 'Generations' },
  { value: 'characters', label: 'Characters' },
  { value: 'products', label: 'Products' },
  { value: 'brands', label: 'Brand kits' },
  { value: 'voices', label: 'Voices' },
]
const lines = {
  generations: 'Everything you have made, saved in this browser.',
  characters: 'Faces to keep consistent across prompts.',
  products: 'What you sell, ready to drop into a scene.',
  brands: 'Logo, colors and voice in one place.',
  voices: 'Voices to reuse in talking heads, ads and dubs.',
}

export default function Library({ gens }) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab = tabs.some((t) => t.value === raw) ? raw : 'generations'
  const scope = useScope()
  return (
    <main className="page">
      <div className="page-head">
        <h1>Assets</h1>
        <p>{lines[tab]}</p>
        <div className="lib-head-row">
          <Segmented value={tab} onChange={(v) => setParams(v === 'generations' ? {} : { tab: v }, { replace: true })} options={tabs} />
          {tab !== 'voices' && <WorkspaceScope {...scope} />}
        </div>
      </div>
      <div key={tab} className="lib-body">
        {tab === 'generations' ? <Generations gens={gens} scope={scope.scope} onAll={() => scope.setAll(true)} /> : tab === 'voices' ? <Voices /> : <Assets type={tab} scope={scope.scope} />}
      </div>
    </main>
  )
}
