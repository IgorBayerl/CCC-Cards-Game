import { useState, useEffect } from 'react'

const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length
  let temporaryValue: T, randomIndex: number

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    temporaryValue = array[currentIndex] as T
    array[currentIndex] = array[randomIndex] as T
    array[randomIndex] = temporaryValue
  }

  return array
}

type IUseShuffleArray<T> = [T, () => void]

export const useShuffleArray = <T>(inputArray: T[]): IUseShuffleArray<T> => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * inputArray.length)
  )
  const [shuffledArray, setShuffledArray] = useState<T[]>(
    shuffleArray([...inputArray])
  )

  useEffect(() => {
    setShuffledArray(shuffleArray([...inputArray]))
  }, [inputArray])

  const nextElement = () => {
    const nextIndex = (currentIndex + 1) % shuffledArray.length
    setCurrentIndex(nextIndex)
  }

  if (!shuffledArray[currentIndex]) {
    throw new Error('Element not found in the shuffled array')
  }

  return [shuffledArray[currentIndex] as T, nextElement]
}
