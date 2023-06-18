import Image from 'next/image'

export default function CCCIconThemed(): JSX.Element {
  return (
    <div className="relative" title="Cyber Chaos Cards">
      <Image
        src="/icon_cyber_chaos_cards.svg"
        alt="cyber chaos cards icon"
        width={100}
        height={100}
        className="block"
      />

      {/* <Image
        src="/icon_cyber_chaos_cards_dark.svg"
        alt="cyber chaos cards icon"
        width={100}
        height={100}
        className="dark:hidden"
      /> */}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-black px-2 font-extrabold text-red-500 shadow-2xl">
        Beta
      </span>
    </div>
  )
}
