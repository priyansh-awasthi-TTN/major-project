const DEFAULT_PALETTE = {
  backdrop: '#eef2ff',
  accent: '#c7d2fe',
  hair: '#1f2937',
  skin: '#f2c8a8',
  shirt: '#4338ca',
};

export default function ApplicantPortrait({ palette = DEFAULT_PALETTE, className = '' }) {
  const colors = { ...DEFAULT_PALETTE, ...palette };

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{
        background: `linear-gradient(180deg, ${colors.backdrop} 0%, ${colors.accent} 100%)`,
      }}
    >
      <div
        className="absolute left-1/2 top-[15%] h-[28%] w-[30%] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: colors.hair }}
      />
      <div
        className="absolute left-1/2 top-[24%] h-[23%] w-[25%] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: colors.skin }}
      />
      <div
        className="absolute left-1/2 top-[18%] h-[13%] w-[33%] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: colors.hair }}
      />
      <div
        className="absolute bottom-[-8%] left-1/2 h-[44%] w-[58%] -translate-x-1/2 rounded-t-full"
        style={{ backgroundColor: colors.shirt }}
      />
    </div>
  );
}
