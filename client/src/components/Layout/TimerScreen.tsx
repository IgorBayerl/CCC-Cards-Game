import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface ITimerScreenProps {
  title?: string
  subtitle?: string
  time: number
  handleTimeout: () => void
  timerKey?: string
}

export default function TimerTitle({
  title = '',
  subtitle = '',
  time,
  handleTimeout,
  timerKey = 'timer_1',
}: ITimerScreenProps) {
  return (
    <div className="flex flex-col bg-destaque-mobile">
      <div className=" flex w-full justify-between  p-3">
        <div className="flex flex-col font-bold">
          <h2 className="m-0 p-0 text-xl">{title}</h2>
          <h3 className="m-0 p-0 text-lg">{subtitle}</h3>
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
    </div>
  )
}
