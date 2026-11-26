import Link from 'next/link';

interface NotFoundViewProps {
  title: string;
  description: string;
  href: string;
  label: string;
}

// Matches public/html/not_found.html. Tokens follow .agent/design-system.md.
export default function NotFoundView({
  title,
  description,
  href,
  label
}: NotFoundViewProps) {
  return (
    <section className="flex min-h-[calc(100vh-135px)] w-full items-center justify-center bg-gray-soft px-6 py-16 font-body md:py-24">
      <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
        <p className="mb-6 font-[family-name:var(--font-heading)] text-[6rem] font-extrabold leading-none tracking-tight text-navy md:text-[9rem]">
          404
        </p>
        <h1 className="mb-3 text-[2rem] font-bold leading-[1.3] tracking-tight text-navy md:text-[2.75rem]">
          {title}
        </h1>
        <p className="mb-10 text-[1.125rem] leading-relaxed text-body md:text-[1.2rem]">
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange px-8 py-4 font-[family-name:var(--font-heading)] text-lg font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] hover:bg-orange-hover"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
