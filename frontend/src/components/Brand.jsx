export default function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900">
      <img src={`${import.meta.env.BASE_URL}medfind.svg`} alt="" width="36" height="36" />
      <span>Med<span className="text-teal-700">Find</span></span>
    </span>
  );
}
