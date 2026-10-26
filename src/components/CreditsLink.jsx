import { COMFY_CREDITS_URL, needsComfyCredits } from '../lib/catalog.js'

// A Comfy insufficient credits failure gets a direct way to top up, wherever the failure shows.
export default function CreditsLink({ message, className = 'credits-link' }) {
  if (!needsComfyCredits(message)) return null
  return <a className={className} href={COMFY_CREDITS_URL} target="_blank" rel="noreferrer">Add Comfy credits</a>
}
