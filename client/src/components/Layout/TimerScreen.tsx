import CountdownTimer from '../Atoms/CountdownBar'

interface ITimerScreenProps {
  title?: string
  subtitle?: string
  time: number
  timerKey?: string
}

export default function TimerTitle({
  title = '',
  subtitle = '',
  time = 10,
  timerKey = 'timer_1',
}: ITimerScreenProps) {

  return (
    <div className="flex flex-col text-white md:pl-4 pl-0">
      <CountdownTimer
        key={timerKey}
        time={time - 1}
      />
      <div className="flex w-full justify-between py-3 md:pl-0 pl-3">
        <div className="flex flex-col text-accent ">
          <h2 className="m-0 p-0 text-xl text-white font-bold">{title}</h2>
          <h3 className="m-0 p-0 text-lg text-slate-300 font-regular">{subtitle}</h3>
        </div>
      </div>
    </div>
  )
}
