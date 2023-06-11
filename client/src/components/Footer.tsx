import Link from 'next/link'
import ConnectionStatus from './Atoms/ConnectionStatus'
import useTranslation from 'next-translate/useTranslation'

export default function Footer(): JSX.Element {
  const { t } = useTranslation('common')

  const howToPlayText = t('i-how-to-play')
  const termsOfServiceText = t('i-terms-of-service')
  const privacyText = t('i-privacy-policy')
  const contactText = t('i-contact')
  const aboutText = t('i-about')

  return (
    <footer className=" mt-5 hidden items-center justify-center md:flex">
      <Link href="howToPlay">
        <button className="btn-ghost btn-block btn-sm btn text-xs">
          {howToPlayText}
        </button>
      </Link>
      <div className="divider divider-horizontal" />
      <Link href="/terms">
        <button className="btn-ghost btn-block btn-sm btn text-xs">
          {termsOfServiceText}
        </button>
      </Link>
      <div className="divider divider-horizontal" />
      <Link href="privacy">
        <button className="btn-ghost btn-block btn-sm btn text-xs">
          {privacyText}
        </button>
      </Link>
      <div className="divider divider-horizontal" />
      <Link href="/contact">
        <button className="btn-ghost btn-block btn-sm btn text-xs">
          {contactText}
        </button>
      </Link>
      <div className="divider divider-horizontal" />
      <Link href="/about">
        <button className="btn-ghost btn-block btn-sm btn text-xs">
          {aboutText}
        </button>
      </Link>
      <div className="divider divider-horizontal" />
      <ConnectionStatus />
    </footer>
  )
}
