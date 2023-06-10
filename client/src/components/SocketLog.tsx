import { useEffect, useState } from 'react'
import { useSocketContext } from '~/components/SocketContext'

export default function SocketLog(): JSX.Element {
  const { socket } = useSocketContext()
  const [messages, setMessages] = useState<string[]>([])
  useEffect(() => {
    if (!socket) return
    socket.on('notify:log', (message: string) => {
      console.log('>>> SERVER LOG: ', message)
      setMessages((prevMessages) => [...prevMessages, message])
    })

    return () => {
      socket?.off('notify:log')
    }
  }, [socket])

  return (
    <div className="bg-slate-200">
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{JSON.stringify(message)}</li>
        ))}
      </ul>
    </div>
  )
}
