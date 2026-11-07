
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import { searchDoctors } from "../api/doctors";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://medfind-0woa.onrender.com/api"
).replace(/\/$/, "");

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clinics, setClinics] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      try {
        const { items } = await searchDoctors({ pageSize: 3 }, { signal: controller.signal });
        if (!controller.signal.aborted) setFeatured(items);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Не удалось загрузить врачей.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDoctors();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClinics() {
      try {
        const response = await fetch(`${API_BASE_URL}/clinics`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Не удалось загрузить клиники");

        const data = await response.json();
        const items = Array.isArray(data) ? data : data?.items ?? [];

        setClinics(items.slice(0, 4));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Ошибка загрузки клиник:", err);
        }
      } finally {
        if (!controller.signal.aborted) setClinicsLoading(false);
      }
    }

    loadClinics();
    return () => controller.abort();
  }, []);

  return (
    <main className="overflow-hidden bg-[#fffefa] text-[#122d43]">
      {/* Hero */}
      <section className="relative border-b border-[#edf0ed]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-4 lg:py-24">
          <div className="relative z-10">
            <h1 className="mt-7 max-w-3xl font-display text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#122d43] sm:text-6xl lg:text-7xl">
              Забота о здоровье
              <span className="mt-1 block text-[#087b78]">
                в одном месте
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#637587] sm:text-lg">
              Найдите врача, выберите клинику и узнайте, где купить нужные лекарства.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute left-[8%] top-[8%] h-[75%] w-[80%] rounded-full bg-[#e2f5f0]" />
            <div className="absolute right-[5%] top-[18%] h-24 w-24 rounded-full bg-[#d6e9fa]" />
            <div className="absolute bottom-[8%] left-[1%] h-20 w-20 rounded-full bg-[#f9e8d4]" />

            <div className="relative flex min-h-[380px] items-center justify-center sm:min-h-[490px]">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=85"
                alt="Врач в медицинском халате"
                className="relative z-10 h-[370px] w-[78%] rounded-[48%_48%_24px_24px] object-cover object-top shadow-[0_24px_70px_rgba(18,45,67,0.12)] sm:h-[470px]"
              />

              <div className="absolute bottom-8 left-0 z-20 max-w-[220px] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e2f5f0] text-xl text-[#087b78]">
                    ♡
                  </div>
                  <div>
                    <p className="text-xs text-[#718092]">Ваше здоровье</p>
                    <p className="mt-1 text-sm font-semibold text-[#122d43]">
                      В надёжных руках
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-10 z-20 max-w-[145px] rotate-3 rounded-2xl border border-white bg-white/95 p-4 shadow-lg sm:right-1">
                <p className="text-sm font-semibold leading-5 text-[#087b78]">
                  Найдите своего специалиста
                </p>
                <p className="mt-2 text-xs leading-5 text-[#718092]">
                  Просто. Удобно. Надёжно.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#edf0ed] bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8">
            {[
              ["01", "Найдите врача", "По специальности или имени"],
              ["02", "Сравните варианты", "Изучите опыт и стоимость"],
              ["03", "Запланируйте визит", "Выберите удобное время"],
            ].map(([number, title, description]) => (
              <div key={number} className="flex items-center gap-4">
                <span className="font-display text-2xl text-[#087b78]/60">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#122d43]">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-[#718092]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section
        id="featured-doctors"
        className="mx-auto max-w-7xl scroll-mt-8 px-5 pt-20 sm:px-8 sm:pt-24"
      >
        <SectionTitle
          description="Изучите профили и выберите специалиста для консультации."
          link="/search"
          linkText="Все врачи"
        />

        <div className="mt-8">
          {loading ? (
            <LoadingGrid count={3} />
          ) : error ? (
            <div
              role="alert"
              className="rounded-3xl border border-red-100 bg-white p-8 text-center"
            >
              <p className="font-semibold text-red-700">
                Не удалось загрузить врачей
              </p>
              <p className="mt-2 text-sm text-[#718092]">{error}</p>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Врачи скоро появятся"
              description="Перейдите в поиск, чтобы посмотреть доступных специалистов."
              link="/search"
              linkText="Перейти к поиску"
            />
          )}
        </div>
      </section>

      {/* Clinics */}
      <section
        id="featured-clinics"
        className="mt-20 bg-[#f0f7f4] py-20 sm:mt-24 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionTitle
            description="Ознакомьтесь с медицинскими учреждениями и их информацией."
            link="/clinics"
            linkText="Все клиники"
          />

          <div className="mt-8">
            {clinicsLoading ? (
              <LoadingGrid />
            ) : clinics.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {clinics.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Клиники скоро появятся"
                description="Посмотрите страницу всех медицинских учреждений."
                link="/clinics"
                linkText="Все клиники"
              />
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#122d43] p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-12 h-60 w-60 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#80d9c5]">
                ПРОСТО И УДОБНО
              </p>
              <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Забота о здоровье начинается с правильного выбора.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
                MedFind помогает изучать информацию о врачах и клиниках,
                чтобы вам было проще подготовиться к визиту.
              </p>
              <Link
                to="/search"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#122d43] transition hover:bg-[#e4f6ef]"
              >
                Найти своего врача <span>↗</span>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: "⌕",
                  title: "Найдите врача",
                  text: "Выберите специальность или воспользуйтесь поиском.",
                },
                {
                  number: "02",
                  icon: "▤",
                  title: "Изучите профиль",
                  text: "Сравните информацию, опыт и стоимость приёма.",
                },
                {
                  number: "03",
                  icon: "▦",
                  title: "Выберите время",
                  text: "Откройте профиль врача и перейдите к записи.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/[0.1]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#80d9c5]/15 text-2xl text-[#80d9c5]">
                      {step.icon}
                    </span>
                    <span className="text-sm font-semibold text-white/35">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title, description, link, linkText }) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087b78]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#122d43] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718092] sm:text-base">
          {description}
        </p>
      </div>

      <Link
        to={link}
        className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#087b78] transition hover:text-[#064f52]"
      >
        {linkText} <span>↗</span>
      </Link>
    </div>
  );
}

function ClinicCard({ clinic }) {
  const photoUrl = clinic.photoUrl || clinic.PhotoUrl;
  const address = clinic.address || clinic.Address;
  const city = clinic.cityName || clinic.CityName;

  return (
    <Link
      to={`/clinics/${clinic.id}`}
      className="group overflow-hidden rounded-[1.5rem] border border-[#e3ebe6] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(18,45,67,0.08)]"
    >
      <div className="relative h-48 overflow-hidden bg-[#dfeee8]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={clinic.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e2f5f0] to-[#dbe9f7] text-5xl text-[#087b78]">
            +
          </div>
        )}

        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-[#087b78] shadow-sm transition group-hover:bg-[#086e70] group-hover:text-white">
          ↗
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-[#122d43]">
          {clinic.name || "Медицинская клиника"}
        </h3>

        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#718092]">
          <span className="text-[#087b78]">⌖</span>
          <span>{city || address || "Информация уточняется"}</span>
        </p>

        {city && address && (
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#718092]">
            {address}
          </p>
        )}

        <p className="mt-4 border-t border-[#edf0ed] pt-4 text-sm font-semibold text-[#087b78]">
          Подробнее о клинике →
        </p>
      </div>
    </Link>
  );
}

function LoadingGrid({ count = 4 }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${count === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
      {Array.from({ length: count }, (_, index) => index).map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-3xl border border-[#e8eeeb] bg-white"
        >
          <div className="h-48 animate-pulse bg-[#eaf2ee]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-5 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
            <div className="h-10 animate-pulse rounded-full bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description, link, linkText }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#cddbd5] bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf7f3] text-2xl text-[#087b78]">
        +
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-[#122d43]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#718092]">{description}</p>
      <Link
        to={link}
        className="mt-5 inline-flex rounded-full bg-[#086e70] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#075c5e]"
      >
        {linkText} ↗
      </Link>
    </div>
  );
}
