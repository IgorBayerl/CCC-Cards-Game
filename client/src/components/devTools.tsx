import { MessageType } from '~/lib/shared/types'
import { useGameContext } from './GameContext'

export default function DevTools() {
  const { roomId, sendToRoom } = useGameContext()

  if (!roomId) return null

  function loadState() {
    sendToRoom(MessageType.DEV_LOAD_SNAPSHOT, null)
  }

  function saveState() {
    sendToRoom(MessageType.DEV_SAVE_SNAPSHOT, null)
  }

  return (
    <div className="absolute bottom-3 right-3 flex  flex-col items-center justify-center gap-3">
      <button className="btn-accent rounded-lg px-4 py-2" onClick={loadState}>
        Load
      </button>
      <button className="btn-primary rounded-lg px-4 py-2" onClick={saveState}>
        Save
      </button>
    </div>
  )
}
