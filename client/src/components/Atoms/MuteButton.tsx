import { ActionIcon } from '@mantine/core'
import { IconVolumeOff, IconVolume } from '@tabler/icons-react'
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
    <ActionIcon variant="outline" color="blue" onClick={handleToggle}>
      {isMuted ? <IconVolumeOff /> : <IconVolume />}
    </ActionIcon>
  )
}
