import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface ITimerScreenProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  time: number
  handleTimeout: () => void
  timerKey?: string
}

export default function TimerScreen({
  children,
  title = '',
  subtitle = '',
  time,
  handleTimeout,
  timerKey = 'timer_1',
}: ITimerScreenProps) {
  return (
    <div className="flex flex-col">
      <div className=" flex w-full justify-between  p-3">
        <div className="flex flex-col">
          <h2 className="m-0 p-0">{title}</h2>
          <h3 className="m-0 p-0">{subtitle}</h3>
        </div>
        <CountdownCircleTimer
          isPlaying
          size={70}
          key={timerKey}
          duration={time}
          colors={['#004777', '#F7B801', '#A30000', '#A30000']}
          colorsTime={[7, 5, 2, 0]}
          onComplete={handleTimeout}
        >
          {({ remainingTime }) => remainingTime}
        </CountdownCircleTimer>
      </div>
      <div>{children}</div>
    </div>
  )
}
