import useTranslation from "next-translate/useTranslation";

const FilterLabel = ({ length, label }: { length: number; label: string }) => {
  const { t } = useTranslation('lobby')

  return (
    <span className="flex gap-2">
      <span>{length > 0 ? `${length} ${t('i-selected')}` : label}</span>
    </span>
  )
}

export default FilterLabel