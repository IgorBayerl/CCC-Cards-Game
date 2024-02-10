import { useCallback } from 'react'

interface ShareData {
  title: string
  text: string
  url: string
}

const useShare = () => {
  const share = useCallback(async (data: ShareData) => {
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else if (navigator.clipboard) {
        console.error(
          'Share API is not supported in your browser. Copying to clipboard instead.'
        )
        await navigator.clipboard.writeText(data.url)
      } else {
        console.error(
          'Clipboard and Share API are not supported in your browser.'
        )
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }, [])

  return share
}

export default useShare
