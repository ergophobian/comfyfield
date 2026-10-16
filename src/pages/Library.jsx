import { useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import Generations from '../components/library/Generations.jsx'
import Assets from '../components/library/Assets.jsx'

const tabs = [
  { value: 'generations', label: 'Generations' },
  { value: 'characters', label: 'Characters' },
  { value: 'products', label: 'Products' },
  { value: 'brands', label: 'Brand kits' },
]
const lines = {
  generations: 'Everything you have made, saved in this browser.',
  characters: 'Faces to keep consistent across prompts.',
  products: 'What you sell, ready to drop into a scene.',
  brands: 'Logo, colors and voice in one place.',
}

export default function Library({ gens }) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab = tabs.some((t) => t.value === raw) ? raw : 'generations'
  return (
    <main className="page">
      <div className="page-head">
        <h1>Library</h1>
        <p>{lines[tab]}</p>
        <Segmented value={tab} onChange={(v) => setParams(v === 'generations' ? {} : { tab: v }, { replace: true })} options={tabs} />
      </div>
      <div key={tab} className="lib-body">
        {tab === 'generations' ? <Generations gens={gens} /> : <Assets type={tab} />}
      </div>
    </main>
  )
}
