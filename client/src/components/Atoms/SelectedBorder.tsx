import classNames from 'classnames'

interface SelectedBorderProps {
  children: React.ReactNode,
  active: boolean,
  dark?: boolean,
}

/**
 * When `active` puts a white border around the children
 */
const SelectedBorder: React.FC<SelectedBorderProps> = ({ children, active, dark = false }) => {

  const color = dark ? 'border-gray-800' : 'border-white'

  return (
    <div
      className={
        classNames(
          "flex flex-1 h-auto flex-nowrap items-center justify-between gap-2 normal-case border-2",
          {
            [color]: active,
            "rounded-md": active,
            "border-transparent rounded-md": !active,
          }
        )
      }
    >
      {children}
    </div>
  )
}

export default SelectedBorder