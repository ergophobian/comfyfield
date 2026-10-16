import { createContext, useContext } from 'react'

// Shared across pages: generations, the composer's model picker, provider connections,
// and openFormat(idOrFormat, initialValues) which opens any format in the shared sheet.
export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)
