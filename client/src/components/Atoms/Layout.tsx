import { HeaderSimple } from './Header'
import { FooterSocial } from './Footer'

interface ILayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: ILayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <HeaderSimple links={[]} />
      <div className="mx-5 flex justify-center">{children}</div>
      <FooterSocial />
    </div>
  )
}
