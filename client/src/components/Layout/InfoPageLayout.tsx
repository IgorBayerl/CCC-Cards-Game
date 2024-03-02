import useTranslation from 'next-translate/useTranslation'
import { DiscordLogo, DotsThree, Globe, House, Info } from '@phosphor-icons/react'
import CCCIconThemed from '~/components/Atoms/CCCIconThemed'
import Link from 'next/link'
import Footer from '~/components/Footer'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import Clickable from '../Atoms/Clickable'
import SelectedBorder from '../Atoms/SelectedBorder'
import ConnectionStatus from '../Atoms/ConnectionStatus'

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

  const modalLanguagesRef = useRef<HTMLDialogElement>(null)

  const handleOpenModalLanguage = () => {
    modalLanguagesRef.current?.showModal()
  }

  const modalMenuRef = useRef<HTMLDialogElement>(null)

  const handleOpenModalMenu = () => {
    modalMenuRef.current?.showModal()
  }


  return (
    <div className="min-h-screen-safe flex flex-col justify-between px-5 py-5 md:justify-center">
      <header className="flex justify-between md:hidden">
        <button onClick={handleOpenModalMenu} className="btn-accent btn">
          <DotsThree size={25} weight="bold" />
        </button>
        <CCCIconThemed />
        <button onClick={handleOpenModalLanguage} className="btn-accent btn uppercase">
          <Globe size={25} weight="bold" /> {router.locale}
        </button>
      </header>
      <div className="game-container-border flex flex-1 flex-col gap-3 md:flex-none">
        <div className="hidden w-full items-center justify-between md:flex">
          <button
            onClick={handleOpenModalLanguage}
            className="btn-outline btn-accent btn flex gap-2 font-bold uppercase"
          >
            <Globe size={25} weight="bold" /> {router.locale}
          </button>
          <CCCIconThemed />
          <Link
            className="btn-outline btn-accent btn"
            href="https://discord.gg/eZsFkPuADE"
            target="_blank"
          >
            <DiscordLogo size={25} weight="bold" />
          </Link>
        </div>
        <div className="flex-1 gap-5 flex py-10 max-h-[calc(100%_-_10rem)]">
          <div className="w-full gap-5 text-white md:flex md:rounded-xl md:p-5 md:text-gray-800 lg:flex lg:flex-row">
            {children}
          </div>
        </div>

        <Footer />
      </div>
      <dialog ref={modalLanguagesRef} className="modal modal-bottom sm:modal-middle text-gray-800">
        <div className="modal-box flex flex-col gap-3">
          <h3 className="font-bold text-lg">{selectYourLanguageText}</h3>
          <div className="flex flex-col gap-2">
            {router.locales &&
              router.locales.map((locale) => (
                <Link key={locale} href={router.asPath} locale={locale}>
                  <SelectedBorder dark={true} active={router.locale === locale}>
                    <div className="px-2 py-2 flex flex-1 text-lg uppercase items-center justify-center">
                      {locale}
                    </div>
                  </SelectedBorder>
                </Link>
              ))}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog ref={modalMenuRef} className="modal modal-bottom sm:modal-middle text-gray-800">
        <div className="modal-box flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <button className="btn-ghost btn-block btn-sm btn font-bold hover:bg-white hover:bg-opacity-50">
                {homeText}
              </button>
            </Link>
            <div className="divider divider-horizontal" />
            <Link href="/terms">
              <button className="btn-ghost btn-block btn-sm btn font-bold hover:bg-white hover:bg-opacity-30">
                {termsOfServiceText}
              </button>
            </Link>
            <div className="divider divider-horizontal" />
            <Link href="privacy">
              <button className="btn-ghost btn-block btn-sm btn font-bold hover:bg-white hover:bg-opacity-30">
                {privacyText}
              </button>
            </Link>
            <div className="divider divider-horizontal" />
            <Link href="/contact">
              <button className="btn-ghost btn-block btn-sm btn font-bold hover:bg-white hover:bg-opacity-30">
                {contactText}
              </button>
            </Link>
            <div className="divider divider-horizontal" />
            <div className='flex justify-center'>
              <ConnectionStatus />
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
