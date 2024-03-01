import { useRef } from "react";
import { Globe } from "@phosphor-icons/react";
import FilterLabel from "./FilterLabel";
import { type DeckFilters } from "@ccc-cards-game/types";
import { useQuery } from "react-query";
import { fetchLanguages } from "~/api/deck";
import LoadingFullScreen from "./LoadingFullScreen";
import useTranslation from "next-translate/useTranslation";
// Import Clickable and SelectedBorder components
import Clickable from "./Clickable";
import SelectedBorder from "./SelectedBorder";

interface DeckFiltersProps {
  setFilters: (filters: DeckFilters) => void,
  filters: DeckFilters,
}

const queryConfig = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
}

const DeckFiltersSection: React.FC<DeckFiltersProps> = ({ setFilters, filters }) => {
  const { t } = useTranslation('lobby')

  const selectLangModal = useRef<HTMLDialogElement>(null);
  const selectDarknessLevelModal = useRef<HTMLDialogElement>(null);

  const languagesResponse = useQuery('get-languages', fetchLanguages, queryConfig)

  const showLangModal = () => {
    selectLangModal.current?.showModal()
  }

  const handleLangChange = (lang: string) => {
    const isLanguageSelected = filters.language.includes(lang);
    const newLanguages = isLanguageSelected
      ? filters.language.filter(language => language !== lang) // Remove the language if it's already selected
      : [...filters.language, lang]; // Add the language if it's not selected

    const newFilters = {
      ...filters,
      language: newLanguages,
    };

    setFilters(newFilters);
  };

  const showDarknessLevelModal = () => {
    selectDarknessLevelModal.current?.showModal()
  }

  const handleDarknessLevelChange = (level: number) => {
    const isLevelSelected = filters.darknessLevel.includes(level);
    const newLevels = isLevelSelected
      ? filters.darknessLevel.filter(l => l !== level)
      : [...filters.darknessLevel, level];

    const newFilters = {
      ...filters,
      darknessLevel: newLevels,
    };

    setFilters(newFilters);
  };

  const categoriesMock = [
    { id: 1, name: t('i-safe') },
    { id: 2, name: t('i-mature-humor') },
    { id: 3, name: t('i-chaos') },
  ];

  if (languagesResponse.isLoading) {
    return <LoadingFullScreen />
  }

  if (languagesResponse.isError || !languagesResponse.data) {
    return <div>Something went wrong!</div>
  }

  const languagesData = languagesResponse.data

  return (
    <div className="flex gap-3 rounded-md bg-white bg-opacity-20 p-2 md:mx-3">
      <button
        onClick={showLangModal}
        className="btn-outline btn btn-accent justify-between gap-2"
      >
        <Globe size={25} weight="bold" />
        <FilterLabel length={1} label={t('i-all')} />
      </button>
      <button
        onClick={showDarknessLevelModal}
        className="btn-outline btn btn-accent justify-center gap-2 flex-1"
      >
        <FilterLabel length={filters.darknessLevel.length} label={t('i-darkness-level')} />
      </button>
      <dialog ref={selectLangModal} className="modal modal-bottom sm:modal-middle text-gray-800">
        <div className="modal-box flex flex-col gap-3">
          <h3 className="font-bold text-lg">Filter By Language</h3>
          <div className="flex flex-col gap-2">
            {languagesData.map((language) => (
              <Clickable key={language} onClick={() => handleLangChange(language)}>
                <SelectedBorder dark={true} active={filters.language.includes(language)}>
                  <div className="px-2 py-2 flex flex-1 text-lg uppercase">
                    <span>{language}</span>
                  </div>
                </SelectedBorder>
              </Clickable>
            ))}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      <dialog ref={selectDarknessLevelModal} className="modal modal-bottom sm:modal-middle text-gray-800">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Filter By Darkness Level</h3>
          <div className="flex flex-col gap-2">
            {categoriesMock.map(category => (
              <Clickable key={category.id} onClick={() => handleDarknessLevelChange(category.id)}>
                <SelectedBorder dark={true} active={filters.darknessLevel.includes(category.id)}>
                  <div className="px-2 py-2 flex flex-1 text-lg">
                    <span>{category.name}</span>
                  </div>
                </SelectedBorder>
              </Clickable>
            ))}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default DeckFiltersSection;
