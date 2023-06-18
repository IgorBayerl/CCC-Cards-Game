import useTranslation from 'next-translate/useTranslation'
import { DiscordLogo, DotsThree, House, Info } from '@phosphor-icons/react'
import CCCIconThemed from '~/components/Atoms/CCCIconThemed'
import Link from 'next/link'
import Footer from '~/components/Footer'

interface IInfoPageLayoutProps {
  children: React.ReactNode
}

export default function InfoPageLayout({
  children,
}: IInfoPageLayoutProps): JSX.Element {
  const { t } = useTranslation('common')
  const homeText = t('i-home')

  return (
    <div className="min-h-screen-safe flex flex-col justify-between px-5 py-5 md:justify-center">
      <header className="flex justify-between md:hidden">
        <label htmlFor="my-modal-1" className="btn">
          <DotsThree size={25} weight="bold" />
        </label>
        <CCCIconThemed />
        <label htmlFor="my-modal-2" className="btn">
          <Info size={25} weight="bold" />
        </label>
      </header>
      <div className="game-container-border flex flex-1 flex-col gap-3 md:flex-none">
        <div className="hidden w-full items-center justify-between md:flex">
          <Link href="/">
            <label
              htmlFor="my-modal-language"
              className="btn-outline btn flex gap-2 font-bold"
            >
              <House size={25} weight="bold" /> {homeText}
            </label>
          </Link>
          <CCCIconThemed />
          <Link
            className="btn-outline btn"
            href="https://discord.gg/eZsFkPuADE"
            target="_blank"
          >
            <DiscordLogo size={25} weight="bold" />
          </Link>
        </div>
        <div className="flex-1 gap-5 py-10 md:flex">
          <div className="w-full flex-1 gap-5 md:flex  md:rounded-xl  md:bg-white md:bg-opacity-50 md:p-5 lg:flex lg:flex-row">
            {children}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
