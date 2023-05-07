import { Card } from '@mantine/core'
import { type ReactNode } from 'react'

interface ICheckBoxCardProps {
  id: string
  selected: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
}

export default function CheckBoxCard({
  id,
  selected,
  onChange,
  children,
}: ICheckBoxCardProps) {
  const cardStyle = {
    backgroundColor: selected ? '#ffffff' : '#d6d6d6',
    color: selected ? '#2b2b2b' : '#303030',
  }

  return (
    <label htmlFor={id}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={cardStyle}>
        <input
          id={id}
          type="checkbox"
          checked={selected}
          onChange={onChange}
          hidden
        />
        {children}
      </Card>
    </label>
  )
}
