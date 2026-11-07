import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { getSpecialtyLabel, listSpecialties } from "../api/doctors";

export function useCatalogOptions() {
  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const reportError = (err) => {
      if (err.name !== "AbortError") setError("Не удалось загрузить варианты фильтров.");
    };

    apiRequest("/cities", options).then(setCities).catch(reportError);
    listSpecialties(options).then(setSpecialties).catch(reportError);
    return () => controller.abort();
  }, []);

  return { cities, specialties, error };
}

const fieldClass = "mt-1.5 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-700 focus:outline-2 focus:outline-teal-700";

export default function CatalogFilters({ filters, onChange, onReset, options, placeholder }) {
  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <label className="min-w-0 text-sm font-medium text-slate-700">
          Поиск
          <input
            type="search"
            maxLength={100}
            value={filters.q}
            onChange={(event) => onChange("q", event.target.value)}
            placeholder={placeholder}
            className={fieldClass}
          />
        </label>
        <label className="min-w-0 text-sm font-medium text-slate-700">
          Город
          <select value={filters.cityId} onChange={(event) => onChange("cityId", event.target.value)} className={fieldClass}>
            <option value="">Все города</option>
            {options.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-sm font-medium text-slate-700">
          Специальность
          <select value={filters.specialtyId} onChange={(event) => onChange("specialtyId", event.target.value)} className={fieldClass}>
            <option value="">Все специальности</option>
            {options.specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{getSpecialtyLabel(specialty)}</option>)}
          </select>
        </label>
        <button type="button" onClick={onReset} disabled={!Object.values(filters).some(Boolean)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Сбросить
        </button>
      </div>
      {options.error && <p role="status" className="mt-3 text-sm text-slate-600">{options.error}</p>}
    </div>
  );
}
