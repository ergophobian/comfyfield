import Mask from './Mask.jsx'
import Face from './Face.jsx'
import Video from './Video.jsx'
import Crop from './Crop.jsx'

const widgets = { mask: Mask, face: Face, video: Video, crop: Crop }

export default function InputWidget({ type, ...props }) {
  const Widget = widgets[type]
  return Widget ? <Widget {...props} /> : null
}
