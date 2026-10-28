export const DEFAULT_JOURNEY_CATEGORIES = [
  "Spiritual Formation",
  "Core Pathways",
  "Theology & Doctrine",
  "Community & Fellowship",
  "Prayer & Fasting",
] as const;

export interface ContentNewJourneyModalCategoriesProps {
  categories?: readonly string[] | string[];
  selectedCategories?: string[];
  onToggleCategory?: (category: string) => void;
  onChange?: (categories: string[]) => void;
  className?: string;
}

export function ContentNewJourneyModalCategories({
  categories = DEFAULT_JOURNEY_CATEGORIES,
  selectedCategories = [],
  onToggleCategory,
  onChange,
  className = "",
}: ContentNewJourneyModalCategoriesProps) {
  const handleToggle = (cat: string) => {
    onToggleCategory?.(cat);
    if (onChange) {
      const next = selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat];
      onChange(next);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      {/* Header & Helper */}
      <div className="flex items-center">
        <label className="text-xs font-semibold text-slate-700">Categories</label>
        <span className="text-slate-400 font-normal text-[11px] ml-1">
          (Select at least one)
        </span>
      </div>

      {/* Categories Buttons Container */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => handleToggle(category)}
              className={
                isSelected
                  ? "bg-primary text-white border-transparent px-3 py-1.5 rounded-xl text-xs font-medium shadow-xs transition cursor-pointer select-none"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer select-none"
              }
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContentNewJourneyModalCategories;
