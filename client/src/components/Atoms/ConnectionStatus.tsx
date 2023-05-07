import { useSocketContext } from '~/components/SocketContext'
import { Tooltip } from '@mantine/core'
import clsx from 'clsx'

export default function ConnectionStatus() {
  const { status } = useSocketContext()

  const colorStatus = {
    connected: 'bg-blue-500',
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500',
  }

  const statusMessage = status || 'connecting'

  return (
    <div className="relative mx-5 h-5 w-5">
      <Tooltip withArrow label={statusMessage}>
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 top-0 rounded-full',
            colorStatus[status]
          )}
        />
      </Tooltip>
    </div>
  )
}