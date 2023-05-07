import { useState, useEffect } from 'react'

const shuffleArray = (array: Array<any>) => {
  let currentIndex = array.length
  let temporaryValue, randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

type IUseShuffleArray = [any, () => void]

export const useShuffleArray = (inputArray: Array<any>): IUseShuffleArray => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * inputArray.length)
  )
  const [shuffledArray, setShuffledArray] = useState<Array<any>>([])

  useEffect(() => {
    setShuffledArray(shuffleArray([...inputArray]))
  }, [inputArray])

  const nextElement = () => {
    const nextIndex = (currentIndex + 1) % shuffledArray.length
    setCurrentIndex(nextIndex)
  }

  return [shuffledArray[currentIndex], nextElement]
}
