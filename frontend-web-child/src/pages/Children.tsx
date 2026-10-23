import {
  ChevronDown,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AddChildForm from "../components/children/AddChildForm";
import ChildrenTable from "../components/children/ChildrenTable";
import { useAppData } from "../services/AppDataContext";

type HealthFilter =
  | "Normal"
  | "Perlu Perhatian"
  | "Penting";

type ConditionFilter =
  | "Normal"
  | "Disabilitas";

type GenderFilter =
  | "Laki-laki"
  | "Perempuan";

type AgeFilter =
  | "0-4"
  | "5-9"
  | "10-14"
  | "15-17";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "age-asc"
  | "age-desc";

export default function Children() {
  /* ---------------------------------------------------------------------- */
  /* State                                                                  */
  /* ---------------------------------------------------------------------- */

  const { children: childList, createChild } = useAppData();
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [pageCache, setPageCache] = useState<Map<string, number[]>>(() => new Map());

  const [search, setSearch] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [healthFilters, setHealthFilters] = useState<
    HealthFilter[]
  >([]);

  const [conditionFilters, setConditionFilters] = useState<
    ConditionFilter[]
  >([]);

  const [genderFilters, setGenderFilters] = useState<
    GenderFilter[]
  >([]);

  const [ageFilters, setAgeFilters] = useState<
    AgeFilter[]
  >([]);

  const [sortOption, setSortOption] =
    useState<SortOption>("name-asc");

  /* ---------------------------------------------------------------------- */
  /* Filter                                                                 */
  /* ---------------------------------------------------------------------- */

  const filteredChildren = childList.filter((child) => {
    const keyword = search.toLowerCase().trim();

    const matchesSearch =
      keyword === "" ||
      child.name.toLowerCase().includes(keyword) ||
      child.code.toLowerCase().includes(keyword);

    const matchesHealth =
      healthFilters.length === 0 ||
      healthFilters.includes(child.health);

    const matchesCondition =
      conditionFilters.length === 0 ||
      conditionFilters.includes(child.condition);

    const matchesGender =
      genderFilters.length === 0 ||
      genderFilters.includes(child.gender);

    const age = getAgeInYears(child.dateOfBirth);

    const matchesAge =
      ageFilters.length === 0 ||
      ageFilters.some((range) =>
        matchesAgeRange(age, range),
      );

    return (
      matchesSearch &&
      matchesHealth &&
      matchesCondition &&
      matchesGender &&
      matchesAge
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Sort                                                                   */
  /* ---------------------------------------------------------------------- */

  const sortedChildren = [...filteredChildren].sort(
    (a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name, "id");

        case "name-desc":
          return b.name.localeCompare(a.name, "id");

        case "age-asc":
          // Tanggal lahir lebih baru = anak lebih muda
          return (
            new Date(b.dateOfBirth).getTime() -
            new Date(a.dateOfBirth).getTime()
          );

        case "age-desc":
          // Tanggal lahir lebih lama = anak lebih tua
          return (
            new Date(a.dateOfBirth).getTime() -
            new Date(b.dateOfBirth).getTime()
          );

        default:
          return 0;
      }
    },
  );

  const resultKey = `${search}|${healthFilters.join(",")}|${conditionFilters.join(",")}|${genderFilters.join(",")}|${ageFilters.join(",")}|${sortOption}`;
  const pageCount = Math.max(1, Math.ceil(sortedChildren.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const cacheKey = `${resultKey}|${currentPage}`;
  const pageChildren = useMemo(() => {
    const cachedIds = pageCache.get(cacheKey);
    if (cachedIds) {
      const byId = new Map(sortedChildren.map((child) => [child.id, child]));
      return cachedIds.map((id) => byId.get(id)).filter((child): child is (typeof sortedChildren)[number] => Boolean(child));
    }
    return sortedChildren.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [cacheKey, currentPage, pageCache, sortedChildren]);

  useEffect(() => {
    setPageCache((current) => {
      if (current.has(cacheKey)) return current;
      const next = new Map(current);
      next.set(cacheKey, pageChildren.map((child) => child.id));
      return next;
    });
  }, [cacheKey, pageChildren]);

  useEffect(() => { setPage(1); }, [resultKey]);

  /* ---------------------------------------------------------------------- */
  /* Filter Actions                                                         */
  /* ---------------------------------------------------------------------- */

  function clearFilters() {
    setHealthFilters([]);
    setConditionFilters([]);
    setGenderFilters([]);
    setAgeFilters([]);
  }

  function toggleFilter<T extends string>(
    value: T,
    current: T[],
    setter: React.Dispatch<
      React.SetStateAction<T[]>
    >,
  ) {
    setter((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : [...items, value],
    );
  }

  const activeFilterCount =
    healthFilters.length +
    conditionFilters.length +
    genderFilters.length +
    ageFilters.length;

  /* ---------------------------------------------------------------------- */
  /* Add Child                                                              */
  /* ---------------------------------------------------------------------- */

  async function handleAddChild(
    newChild: (typeof childList)[number],
  ) {
    try {
      await createChild(newChild);
      setPageCache(new Map());
      setPage(1);
      setShowAddForm(false);
    } catch {
      // The shared API provider displays connection and validation errors.
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Data Anak
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Kelola dan pantau data anak dalam pengasuhan Rumah Kasih Ibu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
          >
            <Plus className="h-4 w-4" />

            <span className="hidden sm:inline">
              Tambah Anak
            </span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
        {/* Total Children */}
        <section className="mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />

            <span className="text-sm font-medium text-slate-600">
              {childList.length} anak terdaftar
            </span>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Search / Filter / Sort                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama atau kode anak..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Filter */}
              <button
                type="button"
                onClick={() =>
                  setShowFilter((current) => !current)
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
                  showFilter || activeFilterCount > 0
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />

                <span>Filter</span>

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-700 px-1.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilter ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sort */}
              <button
                type="button"
                onClick={() =>
                  setShowSort((current) => !current)
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
                  showSort
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />

                <span>Urutkan</span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showSort ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Filter Panel                                                     */}
          {/* ---------------------------------------------------------------- */}

          {showFilter && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Filter Data Anak
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Pilih satu atau beberapa pilihan.
                  </p>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset filter
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Kesehatan */}
                <FilterGroup title="Kesehatan">
                  <FilterCheckbox
                    label="Normal"
                    checked={healthFilters.includes("Normal")}
                    onChange={() =>
                      toggleFilter(
                        "Normal",
                        healthFilters,
                        setHealthFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="Perlu Perhatian"
                    checked={healthFilters.includes(
                      "Perlu Perhatian",
                    )}
                    onChange={() =>
                      toggleFilter(
                        "Perlu Perhatian",
                        healthFilters,
                        setHealthFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="Penting"
                    checked={healthFilters.includes("Penting")}
                    onChange={() => toggleFilter("Penting", healthFilters, setHealthFilters)}
                  />
                </FilterGroup>

                {/* Kondisi */}
                <FilterGroup title="Kondisi">
                  <FilterCheckbox
                    label="Normal"
                    checked={conditionFilters.includes(
                      "Normal",
                    )}
                    onChange={() =>
                      toggleFilter(
                        "Normal",
                        conditionFilters,
                        setConditionFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="Disabilitas"
                    checked={conditionFilters.includes(
                      "Disabilitas",
                    )}
                    onChange={() =>
                      toggleFilter(
                        "Disabilitas",
                        conditionFilters,
                        setConditionFilters,
                      )
                    }
                  />
                </FilterGroup>

                {/* Jenis Kelamin */}
                <FilterGroup title="Jenis Kelamin">
                  <FilterCheckbox
                    label="Laki-laki"
                    checked={genderFilters.includes(
                      "Laki-laki",
                    )}
                    onChange={() =>
                      toggleFilter(
                        "Laki-laki",
                        genderFilters,
                        setGenderFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="Perempuan"
                    checked={genderFilters.includes(
                      "Perempuan",
                    )}
                    onChange={() =>
                      toggleFilter(
                        "Perempuan",
                        genderFilters,
                        setGenderFilters,
                      )
                    }
                  />
                </FilterGroup>

                {/* Umur */}
                <FilterGroup title="Umur">
                  <FilterCheckbox
                    label="0-4 tahun"
                    checked={ageFilters.includes("0-4")}
                    onChange={() =>
                      toggleFilter(
                        "0-4",
                        ageFilters,
                        setAgeFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="5-9 tahun"
                    checked={ageFilters.includes("5-9")}
                    onChange={() =>
                      toggleFilter(
                        "5-9",
                        ageFilters,
                        setAgeFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="10-14 tahun"
                    checked={ageFilters.includes("10-14")}
                    onChange={() =>
                      toggleFilter(
                        "10-14",
                        ageFilters,
                        setAgeFilters,
                      )
                    }
                  />

                  <FilterCheckbox
                    label="15-17 tahun"
                    checked={ageFilters.includes("15-17")}
                    onChange={() =>
                      toggleFilter(
                        "15-17",
                        ageFilters,
                        setAgeFilters,
                      )
                    }
                  />
                </FilterGroup>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Sort Panel                                                       */}
          {/* ---------------------------------------------------------------- */}

          {showSort && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Urutkan Data
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Pilih urutan data anak.
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <SortOption
                  label="Nama A-Z"
                  selected={sortOption === "name-asc"}
                  onClick={() =>
                    setSortOption("name-asc")
                  }
                />

                <SortOption
                  label="Nama Z-A"
                  selected={sortOption === "name-desc"}
                  onClick={() =>
                    setSortOption("name-desc")
                  }
                />

                <SortOption
                  label="Umur termuda"
                  selected={sortOption === "age-asc"}
                  onClick={() =>
                    setSortOption("age-asc")
                  }
                />

                <SortOption
                  label="Umur tertua"
                  selected={sortOption === "age-desc"}
                  onClick={() =>
                    setSortOption("age-desc")
                  }
                />
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Result                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-4">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {sortedChildren.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">
              {childList.length}
            </span>{" "}
            anak
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Table                                                             */}
        {/* ---------------------------------------------------------------- */}

        <ChildrenTable
          children={pageChildren}
          page={currentPage}
          pageSize={pageSize}
          total={sortedChildren.length}
          onPageChange={setPage}
        />
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Add Child Modal                                                    */}
      {/* ------------------------------------------------------------------ */}

      {showAddForm && (
        <AddChildForm
          onSubmit={handleAddChild}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter Components                                                          */
/* -------------------------------------------------------------------------- */

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
      />

      <span>{label}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Sort Components                                                            */
/* -------------------------------------------------------------------------- */

function SortOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
        selected
          ? "border-slate-900 bg-violet-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>

      {selected && (
        <span className="text-xs text-slate-300">
          Aktif
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Age Helpers                                                                */
/* -------------------------------------------------------------------------- */

function getAgeInYears(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}

function matchesAgeRange(
  age: number,
  range: AgeFilter,
) {
  switch (range) {
    case "0-4":
      return age >= 0 && age <= 4;

    case "5-9":
      return age >= 5 && age <= 9;

    case "10-14":
      return age >= 10 && age <= 14;

    case "15-17":
      return age >= 15 && age <= 17;

    default:
      return false;
  }
}

