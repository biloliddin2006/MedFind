
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_BASE_URL || "https://medfind-0woa.onrender.com/api"
).replace(/\/$/, "");

async function request(path, token) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.status}`);
  }

  return response.json();
}

export default function AdminDashboard() {
  const { token } = useOutletContext();

  const [stats, setStats] = useState({
    doctors: 0,
    verified: 0,
    clinics: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const [doctors, clinics, requests] = await Promise.all([
          request("/admin/doctors", token),
          request("/admin/assignable-clinics", token),
          request("/admin/clinic-requests?status=Pending", token),
        ]);

        const doctorList = Array.isArray(doctors)
          ? doctors
          : doctors?.items ?? doctors?.doctors ?? [];

        const clinicList = Array.isArray(clinics)
          ? clinics
          : clinics?.items ?? [];

        const pendingList = Array.isArray(requests)
          ? requests
          : requests?.items ?? [];

        setStats({
          doctors: doctorList.length,
          verified: doctorList.filter((d) => d.isVerified).length,
          clinics: clinicList.length,
          pending: pendingList.length,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) loadStats();
  }, [token]);

  const cards = [
    { title: "Total Doctors", value: stats.doctors },
    { title: "Verified Doctors", value: stats.verified },
    { title: "Active Clinics", value: stats.clinics },
    { title: "Pending Requests", value: stats.pending },
  ];

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>

      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <dl className="mt-5 grid overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4 gap-px">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-5">
            <dt className="text-sm font-medium text-slate-600">{card.title}</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{loading || error ? "—" : card.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
