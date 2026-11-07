import { useEffect, useState } from "react";
import { searchDoctors } from "../api/doctors";
import DoctorCard from "../components/DoctorCard";
import CatalogFilters, { useCatalogOptions } from "../components/CatalogFilters";

const emptyFilters = { q: "", cityId: "", specialtyId: "" };

export default function DoctorSearch() {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const options = useCatalogOptions();
  const hasFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const data = await searchDoctors(
          { ...filters, q: filters.q.trim(), page },
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setResult(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, page, retry]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] pb-16">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* Hero - same style as Clinics */}
        <div className="relative overflow-hidden rounded-[2rem] bg-[#173f35] px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-12 h-52 w-52 rounded-full border border-white/10"
          />

          <div className="relative max-w-2xl">
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Найдите своего
              <span className="block text-emerald-200">
                идеального врача
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50/80 sm:text-base">
              Изучайте профили специалистов, сравнивайте опыт и
              стоимость консультации и выбирайте врача для себя
              и своей семьи.
            </p>
          </div>
        </div>

        {/* Search and count */}
        <div className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mt-2 text-sm text-slate-500">
              Выберите врача, чтобы узнать подробности и записаться.
            </p>
          </div>

          {!loading && !error && (
            <p className="text-sm text-slate-500">
              Найдено врачей:{" "}
              <span className="font-semibold text-[#245541]">
                {result.totalCount}
              </span>
            </p>
          )}
        </div>

        <CatalogFilters
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
          options={options}
          placeholder="Имя врача, специальность или клиника"
        />

        {/* Loading */}
        {loading && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-slate-200/80 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="h-5 w-4/5 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                </div>
                <div className="mt-6 h-10 rounded-xl bg-slate-100" />
                <div className="mt-5 h-11 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-white p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                !
              </span>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Не удалось загрузить врачей
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  className="mt-4 rounded-xl bg-[#245541] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f35]"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && result.items.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4ee] text-3xl text-[#245541]">
              ⚕
            </div>

            <h3 className="mt-5 text-xl font-semibold text-[#183d32]">
              {!hasFilters
                ? "Пока нет врачей"
                : "Врачи не найдены"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {!hasFilters
                ? "Когда специалисты появятся в системе, они будут отображаться здесь."
                : "Попробуйте изменить поисковый запрос или выбрать другую специальность."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[#245541] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f35]"
              >
                Показать всех врачей
              </button>
            )}
          </div>
        )}

        {/* Doctor cards */}
        {!loading && !error && result.items.length > 0 && (
          <div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {!loading && !error && result.totalPages > 1 && (
          <nav aria-label="Страницы каталога врачей" className="mt-6 flex items-center justify-center gap-4 text-sm">
            <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-md border border-slate-300 bg-white px-3 py-2 disabled:opacity-40">Назад</button>
            <span>{page} / {result.totalPages}</span>
            <button type="button" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)} className="rounded-md border border-slate-300 bg-white px-3 py-2 disabled:opacity-40">Далее</button>
          </nav>
        )}

        <p className="mt-10 text-center text-xs leading-5 text-slate-400">
          MedFind · Найдите специалиста для заботы о здоровье
        </p>
      </section>
    </main>
  );
}