import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

import { getBackend, Backend, RpcRequest } from '../lib/rpc'
import useWorklet from '../hook/useWorklet'

interface BareProviderProps {
  children: ReactNode
  rpcHandler?: (req: RpcRequest) => void | Promise<void>
}

const BareApiContext = createContext<Backend | null>(null)

export const BareProvider = ({ children, rpcHandler = () => {} }: BareProviderProps) => {
  const [backend, setBackend] = useState<Backend | null>(null)
  const [, rpc] = useWorklet({ rpcHandler })

  useEffect(() => {
    if (!rpc) return
    setBackend(getBackend(rpc))
  }, [rpc])

  return <BareApiContext.Provider value={backend}>{children}</BareApiContext.Provider>
}

export const useBackend = (): Backend | null => useContext(BareApiContext)

export default BareProvider
