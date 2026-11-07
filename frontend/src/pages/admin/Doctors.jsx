import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_BASE_URL || "https://medfind-0woa.onrender.com/api"
).replace(/\/$/, "");

export default function Doctors() {
  const { token } = useOutletContext();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.title || "Request failed",
        );
      }

      return data;
    },
    [token],
  );

  const loadDoctors = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (verifiedFilter !== "all") {
        params.set("verified", verifiedFilter);
      }

      if (search.trim()) {
        params.set("q", search.trim());
      }

      const query = params.toString();
      const data = await request(
        `/admin/doctors${query ? `?${query}` : ""}`, { signal },
      );

      if (!signal?.aborted) setDoctors(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      if (!signal?.aborted) setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [request, verifiedFilter, search]);

  useEffect(() => {
    const controller = new AbortController();
    loadDoctors(controller.signal);
    return () => controller.abort();
  }, [loadDoctors]);

  function getId(doctor) {
    return doctor.id ?? doctor.doctorId;
  }

  async function toggleVerification(doctor) {
    const id = getId(doctor);
    const isVerified = !doctor.isVerified;

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await request(`/admin/doctors/${id}/verification`, {
        method: "PUT",
        body: JSON.stringify({ isVerified }),
      });

      setNotice(
        isVerified
          ? "Врач успешно подтверждён."
          : "Подтверждение врача отменено.",
      );

      await loadDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Doctors</h1>
      <p className="mt-1 text-sm text-slate-600">Review doctor accounts and manage verification.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <input
            type="search"
            aria-label="Search doctors"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm sm:flex-none"
          />
          <select
            aria-label="Verification status"
            value={verifiedFilter}
            onChange={(event) => setVerifiedFilter(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="true">Verified</option>
            <option value="false">Pending verification</option>
          </select>
          <span className="text-sm text-slate-500 sm:ml-auto">{loading ? "Loading…" : `${doctors.length} doctors`}</span>
        </div>

        {notice && <p role="status" className="border-b border-slate-200 px-4 py-3 text-sm text-teal-800">{notice}</p>}
        {error && <p role="alert" className="border-b border-slate-200 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && !error && doctors.map((doctor) => (
                <tr key={getId(doctor)} className="hover:bg-slate-50">
                  <th scope="row" className="px-4 py-3 font-medium text-slate-900">{doctor.fullName || "—"}</th>
                  <td className="break-all px-4 py-3 text-slate-600">{doctor.email || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{doctor.phoneNumber || doctor.phone || "—"}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${doctor.isVerified ? "text-teal-800" : "text-slate-600"}`}>
                    {doctor.isVerified ? "Verified" : "Pending"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" disabled={busyId !== null} onClick={() => toggleVerification(doctor)} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                      {busyId === getId(doctor) ? "Saving…" : doctor.isVerified ? "Revoke verification" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))}
              {(loading || error || doctors.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {loading ? "Loading doctors…" : error ? "Doctors could not be loaded." : "No doctors match the current filters."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
