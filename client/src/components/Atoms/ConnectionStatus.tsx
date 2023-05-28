import classNames from 'classnames'
import { useSocketContext } from '~/components/SocketContext'

export default function ConnectionStatus() {
  const { status } = useSocketContext()

  const colorStatus = {
    connected: 'bg-info',
    disconnected: 'bg-error',
    connecting: 'bg-warning',
  }

  const statusMessage = status || 'connecting'

  const divClassNames = classNames(
    colorStatus[status],
    'mx-5 h-5 w-5 rounded-full border-2'
  )

  return (
    <div className="tooltip" data-tip={statusMessage}>
      <div className={divClassNames} />
    </div>
  )
}
