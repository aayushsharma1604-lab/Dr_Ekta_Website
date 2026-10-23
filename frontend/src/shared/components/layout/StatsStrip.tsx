const STATS = [
  { value: "15+", label: "Years of experience" },
  { value: "15k+", label: "Happy patients" },
  { value: "Gold", label: "Medalist, V.S. Dental College", gold: true },
];

export default function StatsStrip() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
      <img
        src="/dental/clinic-room.jpg"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />

      <div className="relative mx-auto grid max-w-[1400px] gap-y-9 sm:grid-cols-3 sm:gap-x-12">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            className="group border-t border-white/15 pt-6 sm:border-t-0 sm:border-l-2 sm:border-white/25 sm:pl-6 sm:pt-0"
          >
            <p
              className={`font-heading text-5xl font-bold leading-none tracking-[-0.04em] lg:text-6xl ${
                stat.gold ? "text-[#e8c98b]" : "text-white"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {stat.label}
            </p>
            <span className="mt-5 block h-px w-10 bg-white/25 transition-all duration-500 group-hover:w-16 group-hover:bg-[#e8c98b]/70" />
          </div>
        ))}
      </div>
    </section>
  );
}
