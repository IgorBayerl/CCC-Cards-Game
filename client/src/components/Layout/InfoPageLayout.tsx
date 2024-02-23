import useTranslation from 'next-translate/useTranslation'
import { DiscordLogo, DotsThree, Globe, House, Info } from '@phosphor-icons/react'
import CCCIconThemed from '~/components/Atoms/CCCIconThemed'
import Link from 'next/link'
import Footer from '~/components/Footer'
import { useRouter } from 'next/router'

interface IInfoPageLayoutProps {
  children: React.ReactNode
}

export default function InfoPageLayout({
  children,
}: IInfoPageLayoutProps): JSX.Element {
  const { t } = useTranslation('common')
  const homeText = t('i-home')
  const selectYourLanguageText = t('i-select-your-language')
  const router = useRouter()

  const howToPlayText = t('i-how-to-play')
  const termsOfServiceText = t('i-terms-of-service')
  const privacyText = t('i-privacy-policy')
  const contactText = t('i-contact')
  const aboutText = t('i-about')

  return (
    <div className="min-h-screen-safe flex flex-col justify-between px-5 py-5 md:justify-center">
      <header className="flex justify-between md:hidden">
        <button onClick={() => alert(`clicked`)} className="btn-accent btn">
          <DotsThree size={25} weight="bold" />
        </button>
        <CCCIconThemed />
        <button onClick={() => alert(`clicked 2`)} className="btn-accent btn">
          <Info size={25} weight="bold" />
        </button>
      </header>
      <div className="game-container-border flex flex-1 flex-col gap-3 md:flex-none">
        <div className="hidden w-full items-center justify-between md:flex">
          <label
            htmlFor="my-modal-language"
            className="btn-outline btn-accent btn flex gap-2 font-bold"
          >
            <Globe size={25} weight="bold" /> {router.locale}
          </label>
          <CCCIconThemed />
          <Link
            className="btn-outline btn-accent btn"
            href="https://discord.gg/eZsFkPuADE"
            target="_blank"
          >
            <DiscordLogo size={25} weight="bold" />
          </Link>
        </div>
        <div className="flex-1 gap-5 py-10 md:flex">
          <div className="w-full flex-1 gap-5  text-white  md:flex md:rounded-xl md:p-5 md:text-gray-800 lg:flex lg:flex-row">
            {children}
          </div>
        </div>

        <Footer />
      </div>

      <input type="checkbox" id="my-modal-language" className="modal-toggle" />
      <label htmlFor="my-modal-language" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label
            htmlFor="my-modal-language"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h1 className="card-title py-4">{selectYourLanguageText}</h1>
          <ul className="flex flex-col gap-3">
            {router.locales &&
              router.locales.map((locale) => (
                <li key={locale}>
                  <Link href={router.asPath} locale={locale}>
                    <button className="btn-outline btn w-full">{locale}</button>
                  </Link>
                </li>
              ))}
          </ul>
        </label>
      </label>

    </div>
  )
}
