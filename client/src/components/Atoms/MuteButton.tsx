import { SpeakerHigh, SpeakerSimpleSlash } from '@phosphor-icons/react'
import { useState } from 'react'
import useSound from 'use-sound'
import { useAudio } from '../AudioContext'

interface IMuteButtonProps {
  initialMuted?: boolean
  onChange?: (muted: boolean) => void
}

export default function MuteButton({
  initialMuted = false,
  onChange,
}: IMuteButtonProps) {
  const { isMuted, setMuted } = useAudio()

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')

  const handleToggle = () => {
    const newMuted = !isMuted
    setMuted(newMuted)
    onChange && onChange(newMuted)
    newMuted ? playSwitchOff() : playSwitchOn()
  }

  return (
    <label htmlFor="checkbox-mute" className="swap-rotate swap p-2">
      <input
        type="checkbox"
        checked={isMuted}
        onChange={handleToggle}
        id="checkbox-mute"
        hidden
      />
      <SpeakerSimpleSlash className="swap-off" size={25} weight="bold" />
      <SpeakerHigh className="swap-on" size={25} weight="bold" />
    </label>

    // <button onClick={handleToggle} className="btn-outline btn-circle btn">
    //   {isMuted ? (
    //     <SpeakerSimpleSlash size={25} weight="bold" />
    //   ) : (
    //     <SpeakerHigh size={25} weight="bold" />
    //   )}
    // </button>
  )
}
