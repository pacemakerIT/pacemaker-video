interface EbookHeroProps {
  tag?: string;
  title: string;
  titleLine2?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function EbookHero({
  tag = 'With Pacemaker',
  title,
  titleLine2,
  ctaText = 'View the guide',
  ctaHref = '#ebook-list'
}: EbookHeroProps) {
  return (
    <section className="relative flex min-h-[370px] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#e6f0f8] to-white px-4 py-8 text-center md:h-[370px] md:py-0">
      <div
        aria-hidden="true"
        className="animate-services-hero-glow-drift pointer-events-none absolute left-[12%] top-7 h-[220px] w-[220px] rounded-full blur-[2px]"
        style={{
          background:
            'radial-gradient(circle, rgba(0,173,189,0.18) 0%, rgba(0,173,189,0) 72%)'
        }}
      />
      <div
        aria-hidden="true"
        className="animate-services-hero-glow-drift-reverse pointer-events-none absolute bottom-3 right-[10%] h-[260px] w-[260px] rounded-full blur-[2px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,79,2,0.18) 0%, rgba(255,79,2,0) 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-2 text-base font-weight-400 uppercase tracking-[0.16em] text-orange">
          {tag}
        </p>
        <h1 className="mb-8 max-w-[900px] px-4 font-headline text-[32px] font-extrabold leading-tight text-navy md:text-[40px]">
          {title}
          {titleLine2 && (
            <>
              <br className="hidden md:block" />
              {titleLine2}
            </>
          )}
        </h1>
        <a
          href={ctaHref}
          className="animate-services-hero-scroll-float inline-flex items-center justify-center gap-2 rounded-2xl bg-orange px-8 py-4 font-headline text-lg font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-orange-hover"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
