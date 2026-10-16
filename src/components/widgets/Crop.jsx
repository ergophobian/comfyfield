import Upload from './Upload.jsx'
import BoxEditor from './BoxEditor.jsx'

export default function Crop({ value, onChange, setError }) {
  if (!value) return <Upload onChange={onChange} setError={setError} />
  return <div className="widget">
    <BoxEditor value={value} onChange={onChange} />
    <button type="button" className="link-btn" onClick={() => onChange(null)}>New photo</button>
  </div>
}
