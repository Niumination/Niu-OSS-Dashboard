import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface Props {
  micro: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  action?: { href: string; label: React.ReactNode };
}

/** Heading seksi seragam: micro-label mono + judul display serif + aksi link. */
export default function SectionHead({ micro, title, sub, icon: Icon, action }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="micro flex items-center gap-2 text-cream/45">
          {Icon && <Icon className="size-3.5 text-ember" />}
          {micro}
        </div>
        <h2 className="mt-2 font-display text-[30px] leading-tight tracking-tight text-cream md:text-[38px]">
          {title}
        </h2>
        {sub && <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-cream/55">{sub}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-cream/60 transition-colors hover:text-ember"
        >
          {action.label}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
