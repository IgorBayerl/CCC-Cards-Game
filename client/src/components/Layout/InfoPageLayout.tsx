import useTranslation from 'next-translate/useTranslation'
import { DiscordLogo, DotsThree, House, Info } from '@phosphor-icons/react'
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
        <label htmlFor="my-modal-1" className="btn-accent btn">
          <DotsThree size={25} weight="bold" />
        </label>
        <CCCIconThemed />
        <label htmlFor="my-modal-2" className="btn-accent btn">
          <Info size={25} weight="bold" />
        </label>
      </header>
      <div className="game-container-border flex flex-1 flex-col gap-3 md:flex-none">
        <div className="hidden w-full items-center justify-between md:flex">
          <Link href="/">
            <label
              htmlFor="my-modal-language"
              className="btn-outline btn-accent btn flex gap-2 font-bold"
            >
              <House size={25} weight="bold" /> {homeText}
            </label>
          </Link>
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
          <div className="w-full flex-1 gap-5  text-white  md:flex md:rounded-xl md:bg-white md:bg-opacity-60 md:p-5 md:text-gray-800 lg:flex lg:flex-row">
            {children}
          </div>
        </div>

        <Footer />
      </div>
      <input type="checkbox" id="my-modal-1" className="modal-toggle" />
      <label className="modal bg-white bg-opacity-30 p-0" htmlFor="my-modal-1">
        <label className="modal-box relative flex h-full flex-col" htmlFor="">
          <label
            htmlFor="my-modal-1"
            className="btn-circle btn-lg btn absolute right-2 top-2 md:btn-sm"
          >
            ✕
          </label>
          <h3 className=" text-xl font-bold">Cyber Chaos Cards</h3>
          <ul className="flex flex-1 flex-col items-center py-6 text-xl font-bold ">
            <div className="divider" />
            <Link
              href="/"
              className="w-full px-4 py-4 text-center hover:bg-gray-200"
            >
              {homeText}
            </Link>
            <div className="divider" />
            <Link
              href="/terms"
              className="w-full px-4 py-4 text-center hover:bg-gray-200"
            >
              {termsOfServiceText}
            </Link>
            <div className="divider" />
            <Link
              href="/privacy"
              className="w-full px-4 py-4 text-center hover:bg-gray-200"
            >
              {privacyText}
            </Link>
            <div className="divider" />
            <Link
              href="/contact"
              className="w-full px-4 py-4 text-center hover:bg-gray-200"
            >
              {contactText}
            </Link>
          </ul>
          <div className="divider" />
          <div>
            <h1 className="card-title py-4">{selectYourLanguageText}</h1>
            <select
              name="language-mobile"
              id="language-mobile"
              className="select-bordered select w-full uppercase"
              onChange={(e) => {
                void router.push(router.pathname, router.pathname, {
                  locale: e.target.value,
                })
              }}
            >
              {router.locales &&
                router.locales.map((locale) => (
                  <option className="uppercase" key={locale} value={locale}>
                    {locale}
                  </option>
                ))}
            </select>
          </div>
        </label>
      </label>
      <input type="checkbox" id="my-modal-2" className="modal-toggle" />
      <label htmlFor="my-modal-2" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label
            htmlFor="my-modal-2"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <div className="py-4">
            <h1 className="card-title py-4">{t('i-how-to-play')}</h1>
          </div>
        </label>
      </label>
    </div>
  )
}
