import { Card } from '@mantine/core'
import { type ReactNode } from 'react'

interface ICheckBoxCardProps {
  id: string
  value: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
}

export default function CheckBoxCard({
  id,
  value,
  onChange,
  children,
}: ICheckBoxCardProps) {
  const cardStyle = {
    backgroundColor: value ? '#ffffff' : '#d6d6d6',
    color: value ? '#2b2b2b' : '#303030',
  }

  return (
    <label htmlFor={id}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={cardStyle}>
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={onChange}
          hidden
        />
        {children}
      </Card>
    </label>
  )
}
