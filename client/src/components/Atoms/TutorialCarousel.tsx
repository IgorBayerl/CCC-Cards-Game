import Image from 'next/image'

import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'
import { PropsWithChildren, useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import useTranslation from 'next-translate/useTranslation'

const data = [
  {
    image:
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: '1. Calling is better',
    description: 'Invoice your friends to a voice call (e.g. Discord, Zoom)',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1559494007-9f5847c49d94?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: 'One card with blank spaces will be selected.',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title:
      'You should select other cards to fill the blank spaces in the funniest way.',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: 'Aurora in Norway: when to visit for best experience',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: 'The judge of the round will select the funniest card.',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1582721478779-0ae163c05a60?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: 'Laugh with your friends and have fun!',
    category: 'How to play',
  },
  {
    image:
      'https://images.unsplash.com/photo-1582721478779-0ae163c05a60?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    title: 'Make new friends!',
    category: 'How to play',
  },
]

interface CardProps {
  image: string
  title: string
  category: string
}

function Card({ title, category }: CardProps) {
  return (
    <div className="">
      <div>
        {/* <div className="">{category}</div> */}
        <div className="">{title}</div>
      </div>
    </div>
  )
}

type Props = PropsWithChildren & EmblaOptionsType

const Carousel = ({ children, ...options }: Props) => {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))
  const [emblaRef] = useEmblaCarousel(options, [autoplay.current])

  return (
    <div className="h-full overflow-hidden " ref={emblaRef}>
      <div className="flex">{children}</div>
    </div>
  )
}
export default Carousel

export function TutorialCarousel() {
  const { t } = useTranslation('common')
  const howToPlayText = t('i-how-to-play')
  return (
    <div className="h-full ">
      <div className="card-title mb-4 flex items-center justify-center font-bold uppercase">
        {howToPlayText}
      </div>
      <Carousel loop>
        {data.map((item, index) => {
          return (
            <div className="relative h-full flex-[0_0_100%] " key={index}>
              <Card {...item} />
            </div>
          )
        })}
      </Carousel>
    </div>
  )
}
