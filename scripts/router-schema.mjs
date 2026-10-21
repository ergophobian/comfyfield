// Keep validation keywords and resolve local references from public Router OpenAPI documents.
export function routerSchema(document, model) {
  const resolve = (schema) => {
    if (Array.isArray(schema)) return schema.map(resolve)
    if (!schema || typeof schema !== 'object') return schema
    if (schema.$ref) {
      const target = schema.$ref.slice(2).split('/').reduce((value, key) => value[key], document)
      return resolve({ ...target, ...Object.fromEntries(Object.entries(schema).filter(([key]) => key !== '$ref')) })
    }
    const kept = ['type', 'enum', 'required', 'properties', 'items', 'minimum', 'maximum', 'minItems', 'maxItems', 'minLength', 'maxLength', 'pattern', 'nullable', 'anyOf', 'oneOf', 'allOf', 'additionalProperties']
    const out = Object.fromEntries(Object.entries(schema).filter(([key]) => kept.includes(key)).map(([key, value]) => [key, key === 'properties' ? Object.fromEntries(Object.entries(value).map(([field, prop]) => [field, resolve(prop)])) : resolve(value)]))
    if (out.allOf) {
      const parts = out.allOf
      delete out.allOf
      for (const part of parts) {
        out.properties = { ...out.properties, ...part.properties }
        out.required = [...new Set([...(out.required || []), ...(part.required || [])])]
        for (const [key, value] of Object.entries(part)) if (!['properties', 'required'].includes(key)) out[key] = value
      }
    }
    return out
  }
  return resolve(document.paths[`/v2/models/${model}`].post.requestBody.content['application/json'].schema)
}
