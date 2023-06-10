import React, { createContext, useContext } from 'react'
import useSocket, { type UseSocketReturnType } from '~/hooks/socket'

interface SocketContextValue extends UseSocketReturnType {
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: undefined,
  status: 'disconnected',
  connected: false,
})

interface SocketProviderProps {
  url: string
  children?: React.ReactNode
  connected?: boolean
}

const SocketProvider: React.FC<SocketProviderProps> = ({ url, children }) => {
  const socket = useSocket(url)
  const value = {
    socket: socket?.socket || undefined,
    status: socket?.status || 'disconnected',
    connected: socket?.status === 'connected', //SAVE IN SESSION STORAGE
  }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

const useSocketContext = () => useContext(SocketContext)

export { useSocketContext, SocketProvider }
