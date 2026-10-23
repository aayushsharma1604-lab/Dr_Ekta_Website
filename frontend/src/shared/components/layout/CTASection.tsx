import BookAppointment from "../cta/BookAppointment";
import WhatsAppButton from "../cta/WhatsAppButton";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel?: string;
  backgroundImage?: string;
}

export default function CTASection({
  eyebrow = "Private reservation",
  title,
  description,
  primaryLabel = "Book Appointment",
  backgroundImage = "/dental/clinic-room.jpg",
}: CTASectionProps) {
  return (
    <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-slate-950">
        {backgroundImage && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={backgroundImage}
              alt=""
              className="media-drift h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-slate-950/55" />
          </div>
        )}

        <div className="relative px-6 py-14 text-center sm:px-10 lg:py-20" data-reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            {eyebrow}
          </p>
          <h2 className="mt-3 heading-xl text-white">{title}</h2>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl body-lg text-white/70">{description}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BookAppointment
              variant="secondary"
              size="lg"
              label={primaryLabel}
              className="bg-white! text-slate-900! hover:bg-slate-100!"
            />
            <WhatsAppButton className="bg-white/10! text-white! hover:bg-white/20!" />
          </div>
        </div>
      </div>
    </section>
  );
}
