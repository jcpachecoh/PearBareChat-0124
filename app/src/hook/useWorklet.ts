import { useCallback, useState, useEffect } from 'react'
import { Worklet } from 'react-native-bare-kit'
import RPC from 'bare-rpc'

import { RpcRequest } from '../lib/rpc'

interface UseWorkletOptions {
  rpcHandler?: (req: RpcRequest) => void | Promise<void>
  bundleName?: string
}

/**
 * Manages the Bare Worklet and RPC instances.
 * Returns [worklet, rpc] — both null until initialised.
 */
const useWorklet = ({
  rpcHandler = () => {},
  bundleName = '/app.bundle',
}: UseWorkletOptions): [Worklet | null, InstanceType<typeof RPC> | null] => {
  const [worklet, setWorklet] = useState<Worklet | null>(null)
  const [rpc, setRPC] = useState<InstanceType<typeof RPC> | null>(null)

  const initWorklet = useCallback((): Worklet | null => {
    if (worklet) return worklet
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ;(async () => {
        const newWorklet = new Worklet()
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        await newWorklet.start(bundleName, require('../../worklet/app.bundle'))
        setWorklet(newWorklet)
      })()
    } catch (error) {
      console.error('Error initializing Worklet:', error)
    }
    return null
  }, [worklet, bundleName])

  const initRPC = useCallback(
    (currentWorklet: Worklet | null): InstanceType<typeof RPC> | null => {
      if (!currentWorklet || rpc) return rpc
      try {
        const newRPC = new RPC(currentWorklet.IPC, rpcHandler)
        setRPC(newRPC)
        return newRPC
      } catch (error) {
        console.error('Error initializing RPC:', error)
        return null
      }
    },
    [rpc, rpcHandler],
  )

  useEffect(() => {
    const currentWorklet = initWorklet()
    initRPC(currentWorklet)
  }, [initWorklet, initRPC])

  return [worklet, rpc]
}

export default useWorklet
