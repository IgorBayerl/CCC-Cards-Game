interface ILayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: ILayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-blue-500 md:justify-center">
      <div className="h-full bg-red-500 md:p-5">{children}</div>
    </div>
  )
}
