import { useGameContext } from '~/components/GameContext'
import { Timer, Trophy } from '@phosphor-icons/react'
import useTranslation from 'next-translate/useTranslation'

function LobbySettingsTab() {
  const { t } = useTranslation('lobby')
  const { gameConfig, setConfig, isCurrentUserLeader } = useGameContext()

  const handleChangeScoreToWin = (value: string) => {
    const newScoreToWin = parseInt(value)
    setConfig({ ...gameConfig, scoreToWin: newScoreToWin })
  }

  const handleChangeTimeToPlay = (value: string) => {
    const newTimeToPlay = parseInt(value)
    setConfig({ ...gameConfig, roundTime: newTimeToPlay })
  }

  const scoreToWin = gameConfig?.scoreToWin?.toString() || '10'
  const timeToPlay = gameConfig?.roundTime?.toString() || '60'

  return (
    <div className="flex h-full flex-col overflow-y-auto px-2 pt-2 md:px-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="score-to-win" className="flex gap-3 text-white">
          <Trophy size={24} weight="bold" />
          {t('i-score-to-win')}
        </label>
        <select
          className="select select-bordered"
          id="score-to-win"
          onChange={(e) => handleChangeScoreToWin(e.target.value)}
          disabled={!isCurrentUserLeader}
          value={scoreToWin}
        >
          {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
            <option className="text-lg" key={i} value={i.toString()}>
              {`${i} ${t('i-points')}`}
            </option>
          ))}
        </select>
      </div>
      <div className="divider" />
      <div className="flex flex-col gap-2">
        <label htmlFor="score-to-win" className="flex gap-3 text-white">
          <Timer size={24} weight="bold" />
          {t('i-time')}
        </label>
        <select
          className="select select-bordered"
          id="score-to-win"
          onChange={(e) => handleChangeTimeToPlay(e.target.value)}
          disabled={!isCurrentUserLeader}
          value={timeToPlay}
        >
          {Array.from({ length: 6 }, (_, i) => (i + 1) * 10).map((i) => (
            <option className="text-lg" key={`${i}_seconds`} value={i.toString()}>{`${i} ${t('i-seconds')}`}</option>
          ))}
        </select>
      </div>
    </div>
  )
}


export default LobbySettingsTab