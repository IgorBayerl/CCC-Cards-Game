

interface ClickableProps {
  children: React.ReactNode
  onClick?: (data: unknown) => void
}

const Clickable: React.FC<ClickableProps> = ({ children, onClick }) => {
  return (
    <div
      className="btn h-auto w-auto p-0 m-0 flex flex-1 border-0 btn-ghost"
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Clickable