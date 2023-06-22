import BannerRaw from './BannerRaw'

export default function Banner468x60(): JSX.Element {
  return (
    <BannerRaw
      height={60}
      width={468}
      adKey="a8fa94e8e2f69955b14f4983fc94a74d"
      className="mx-2 my-5 hidden items-center justify-center border border-gray-200 text-center text-white md:block"
    />
  )
}
