import { ActionIcon } from '@mantine/core'
import { IconVolumeOff, IconVolume } from '@tabler/icons-react'
import { useState } from 'react'

interface IMuteButtonProps {
  initialMuted?: boolean
  onChange?: (muted: boolean) => void
}

export default function MuteButton({
  initialMuted = false,
  onChange,
}: IMuteButtonProps) {
  const [muted, setMuted] = useState(initialMuted)

  const handleToggle = () => {
    const newMuted = !muted
    setMuted(newMuted)
    onChange && onChange(newMuted)
  }

  return (
    <ActionIcon variant="outline" color="blue" onClick={handleToggle}>
      {muted ? <IconVolumeOff /> : <IconVolume />}
    </ActionIcon>
  )
}
