interface ILayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: ILayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col  md:justify-center">
      <div className="h-full  md:p-5">{children}</div>
    </div>
  )
}
