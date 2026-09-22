export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center p-6 text-center">
      {/* Brand Pulsing Indicator */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-lg animate-pulse">
          U
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/40 animate-ping" />
      </div>

      <div className="space-y-1">
        <div className="text-xs font-black uppercase tracking-widest text-amber-500 font-['Syne',sans-serif]">
          UpRole Intelligence
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Calibrating workspace...
        </p>
      </div>
    </div>
  );
}
