import BannerRaw from './BannerRaw'

export default function Banner160x600(): JSX.Element {
  return (
    <BannerRaw
      height={600}
      width={160}
      adKey="8fc0e4790d8173eaee59bfb8d2881922"
      className="mx-2 my-5 hidden h-10 w-10 items-center justify-center border border-gray-200 bg-red-300 text-center text-white md:block"
    />
  )
}
