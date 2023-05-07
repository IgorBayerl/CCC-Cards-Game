interface IGameLayoutProps {
  children: React.ReactNode
}

export default function GameLayout({
  children,
}: IGameLayoutProps): JSX.Element {
  return <>{children}</>
}
