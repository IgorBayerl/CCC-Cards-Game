import { Card } from '@mantine/core'
import { type ReactNode } from 'react'

interface ICheckBoxCardProps {
  id: string
  selected: boolean
  disabled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
}

export default function CheckBoxCard({
  id,
  selected,
  disabled,
  onChange,
  children,
}: ICheckBoxCardProps) {
  const bgColor = selected ? 'bg-blue-600' : 'bg-gray-200'

  return (
    <label htmlFor={id}>
      <div className={`h-full rounded-xl p-1 ${bgColor}`}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          className="h-full"
        >
          <input
            disabled={disabled}
            id={id}
            type="checkbox"
            checked={selected}
            onChange={onChange}
            hidden
          />
          {children}
        </Card>
      </div>
    </label>
  )
}
