import { useGameContext } from '~/components/GameContext'
import SelectedDecksList from './SelectedDecksList'
import SearchDecks from './SearchDecks'

const LobbyDecksTab: React.FC = () => {
  const { isCurrentUserLeader } = useGameContext()

  if (isCurrentUserLeader) {
    return <SearchDecks />
  }

  return <SelectedDecksList />
}

export default LobbyDecksTab