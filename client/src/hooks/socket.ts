import { useEffect, useState } from 'react'
import io, { type Socket } from 'socket.io-client'

type SocketStatus = 'connecting' | 'connected' | 'disconnected'

export interface UseSocketReturnType {
  socket: Socket | undefined
  status: SocketStatus
}

const useSocket = (url: string): UseSocketReturnType => {
  const [socket, setSocket] = useState<Socket>()
  const [status, setStatus] = useState<SocketStatus>('connecting')

  useEffect(() => {
    setStatus('connecting')
  }, [socket])

  useEffect(() => {
    const newSocket = io(url)

    newSocket.on('connect', () => {
      setStatus('connected')
    })

    newSocket.on('disconnect', () => {
      setStatus('disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [url])

  return { socket, status }
}

export default useSocket
