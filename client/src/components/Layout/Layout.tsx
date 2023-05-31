import { HeaderSimple } from '../Atoms/Header'
// import { FooterSocial } from '../Atoms/Footer'

interface ILayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: ILayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-blue-500 md:justify-center">
      {/* <HeaderSimple links={[]} /> */}
      <div className="h-full bg-red-500 md:p-5">{children}</div>
      {/* <FooterSocial /> */}
      {/* <div></div> */}
    </div>
  )
}
