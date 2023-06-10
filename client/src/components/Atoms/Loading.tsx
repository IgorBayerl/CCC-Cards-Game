export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-flex">
        <div className="h-8 w-8 rounded-full bg-blue-500"></div>
        <div className="absolute left-0 top-0 h-8 w-8 animate-ping rounded-full bg-blue-500"></div>
        <div className="absolute left-0 top-0 h-8 w-8 animate-pulse rounded-full bg-blue-500"></div>
      </div>
    </div>
  )
}
