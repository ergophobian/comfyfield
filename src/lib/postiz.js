export async function postizApi(url, method = 'GET', body) {
  const response = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not reach Postiz.')
  return data
}
