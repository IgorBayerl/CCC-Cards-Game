import { type Deck } from "@ccc-cards-game/types";
import Image from "next/image";

interface DeckItemCardProps {
  deck: Deck;
}

const DecksItem: React.FC<DeckItemCardProps> = ({ deck }) => {
  return (
    <div
      className={'flex flex-1 h-auto flex-nowrap items-center justify-between gap-2 normal-case'}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/icon_dark.png"
          alt={deck.title}
          width={100}
          height={100}
          className="aspect-square h-16 w-16 rounded-xl bg-neutral bg-opacity-70 object-contain"
        />
        <div className="truncate">
          <h1 className="card-title ">{deck.title}</h1>
          <p className="text-sm">{deck.description}</p>
        </div>
      </div>
      <div className="uppercase">{deck.language}</div>
    </div>
  )
}

export default DecksItem