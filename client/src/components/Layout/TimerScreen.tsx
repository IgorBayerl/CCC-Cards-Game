import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface ITimerScreenProps {
  title?: string
  subtitle?: string
  time: number
  timerKey?: string
}

export default function TimerTitle({
  title = '',
  subtitle = '',
  time,
  timerKey = 'timer_1',
}: ITimerScreenProps) {
  return (
    <div className="bg-destaque-mobile flex flex-col font-bold text-white">
      <div className=" flex w-full justify-between  p-3">
        <div className="flex flex-col font-bold text-accent ">
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
        >
          {({ remainingTime }) => remainingTime}
        </CountdownCircleTimer>
      </div>
    </div>
  )
}
