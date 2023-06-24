import BannerRaw from './BannerRaw'

export default function BannerHorizontal(): JSX.Element {
  return (
    <BannerRaw
      height={60}
      width={468}
      adKey="a8fa94e8e2f69955b14f4983fc94a74d"
      className="mx-auto block items-center justify-center border border-gray-200 bg-red-500 text-center text-white md:hidden"
    />
  )
}
