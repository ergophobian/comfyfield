// A thin bar for a Comfy job's reported progress. Nothing shows until the job reports a fraction.
export default function ProgressBar({ progress }) {
  if (progress?.value == null) return null
  const percent = Math.round(progress.value * 100)
  return (
    <span className="job-progress" role="progressbar" aria-label="Render progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <i style={{ '--p': `${percent}%` }} />
    </span>
  )
}
