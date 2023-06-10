import Loading from './Loading'

interface ILoadingWithTextProps {
  text: string
}

export default function LoadingWithText({text}:ILoadingWithTextProps): JSX.Element {
  return (
    <div className="flex justify-center py-5">
      <div className="flex items-center gap-5 px-5">
        <Loading /> {text}
      </div>
    </div>
  )
}
