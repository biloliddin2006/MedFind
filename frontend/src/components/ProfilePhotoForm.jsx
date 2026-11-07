import { useState } from "react";
import { apiRequest } from "../api/client";

export default function ProfilePhotoForm({ endpoint, initialUrl, maxLength, title }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [savedUrl, setSavedUrl] = useState(initialUrl ?? "");
  const [failedUrl, setFailedUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const photoUrl = url.trim();
      if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
        throw new Error("Ссылка должна начинаться с https:// или http://.");
      }
      const result = await apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify({ photoUrl: photoUrl || null }),
      });
      setUrl(result.photoUrl ?? "");
      setSavedUrl(result.photoUrl ?? "");
      setFailedUrl(null);
      setNotice("Изменения сохранены.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {savedUrl && savedUrl !== failedUrl && (
        <img src={savedUrl} alt="Текущее фото профиля" className="mt-3 h-20 w-24 rounded-md object-cover" onError={() => setFailedUrl(savedUrl)} />
      )}
      {savedUrl && savedUrl === failedUrl && <p className="mt-2 text-sm text-slate-600">Фото не загрузилось. Проверьте ссылку.</p>}
      <label className="mt-4 block text-sm font-medium text-slate-700">
        Ссылка на фото
        <input type="url" value={url} maxLength={maxLength} disabled={saving} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/photo.jpg" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <p className="mt-2 text-sm text-slate-500">Укажите прямую ссылку на изображение. Чтобы удалить фото, очистите поле и сохраните.</p>
      <button type="submit" disabled={saving || url.trim() === savedUrl} className="mt-4 rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Сохраняем…" : "Сохранить фото"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-teal-800">{notice}</p>}
    </form>
  );
}
