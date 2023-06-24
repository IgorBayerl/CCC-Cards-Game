import { useClipboard } from '@mantine/hooks'
import { Check, Link } from '@phosphor-icons/react'
import classNames from 'classnames'
import useTranslation from 'next-translate/useTranslation'

interface ICopyToClipboardProps {
  content: string
  text: string
}

export function CopyToClipboard({ content, text }: ICopyToClipboardProps) {
  const { t } = useTranslation('common')
  const clipboard = useClipboard()

  const tooltipCN = classNames(
    'flex items-center justify-between w-full gap-3',
    clipboard.copied && 'tooltip',
    clipboard.copied && 'tooltip-open'
  )

  const icon = clipboard.copied ? (
    <Check size={25} weight="bold" />
  ) : (
    <Link size={25} weight="bold" />
  )

  return (
    <button
      className="btn-outline btn-accent btn flex-1"
      onClick={() => clipboard.copy(content)}
    >
      <div className={tooltipCN} data-tip={t('i-link-copied')}>
        {icon}
        {text}
        <div />
      </div>
    </button>
  )
}
