import { Pictures } from './Inputs.jsx'

export default function AdProductPhotos({ value = [], onChange }) {
  return (
    <div>
      <Pictures label="Product photos" max={8} value={value} onChange={onChange} />
      {value.length > 0 && <div className="field">
        <label>Primary product photo
          <select aria-label="Primary product photo" value={value[0]} onChange={(e) => onChange([e.target.value, ...value.filter((url) => url !== e.target.value)])}>
            {value.map((url, i) => <option key={url} value={url}>Photo {i + 1}{i === 0 ? ' (primary)' : ''}</option>)}
          </select>
        </label>
        <p className="sheet-note">Only the primary photo conditions rendering. Other photos help draft the concept.</p>
      </div>}
    </div>
  )
}
