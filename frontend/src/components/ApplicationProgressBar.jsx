export default function ApplicationProgressBar({ applicationState, className = '' }) {
  if (!applicationState) return null;

  const isSubmitted = applicationState.status === 'submitted';
  const accentClass = isSubmitted ? 'text-blue-600' : 'text-emerald-600';
  const fillClass = isSubmitted ? 'bg-blue-600' : 'bg-emerald-500';
  const width = applicationState.progress > 0 ? Math.max(applicationState.progress, 6) : 0;

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-gray-700">{applicationState.summary}</span>
        <span className={accentClass}>{isSubmitted ? 'Submitted' : 'Draft saved'}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-[width] duration-300 ${fillClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">{applicationState.detail}</p>
    </div>
  );
}
