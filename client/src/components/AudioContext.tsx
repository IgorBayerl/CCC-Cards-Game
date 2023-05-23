import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from 'react'

// Create context with default value assertion
const AudioContext = createContext<
  { isMuted: boolean; setMuted: (muted: boolean) => void } | undefined
>(undefined)

// Provider component
interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isMuted, setMuted] = useState(false)

  return (
    <AudioContext.Provider value={{ isMuted, setMuted }}>
      {children}
    </AudioContext.Provider>
  )
}

// Custom hook to use the AudioContext and dispatch function
export const useAudio = () => {
  const context = useContext(AudioContext)

  // Make sure useAudio is used within an AudioProvider
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }

  return context
}
