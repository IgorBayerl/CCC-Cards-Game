import { useGameContext } from '../GameContext'

export default function ContainerFooter() {
  const { gameState } = useGameContext()

  return <div className="flex justify-center pt-2">{gameState.status}</div>
}
