import { useClipboard } from '@mantine/hooks'
import { Check, Link } from '@phosphor-icons/react'
import classNames from 'classnames'

interface ICopyToClipboardProps {
  content: string
  text: string
}

export function CopyToClipboard({ content, text }: ICopyToClipboardProps) {
  const clipboard = useClipboard()

  const tooltipCN = classNames(
    'tooltip',
    clipboard.copied && 'tooltip-success',
    clipboard.copied && 'tooltip-open'
  )

  const icon = clipboard.copied ? (
    <Check size={36} weight="bold" />
  ) : (
    <Link size={36} weight="bold" />
  )

  return (
    <div className={tooltipCN} data-tip="Link copied!">
      <button
        className="btn-primary btn"
        onClick={() => clipboard.copy(content)}
      >
        {icon}
        {text}
      </button>
    </div>
  )
}
