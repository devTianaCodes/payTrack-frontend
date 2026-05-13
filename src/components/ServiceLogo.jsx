import { Dumbbell } from 'lucide-react';
import { siFigma, siIcloud, siNetflix, siSpotify } from 'simple-icons';

const brandIcons = {
  figma: siFigma,
  icloud: siIcloud,
  netflix: siNetflix,
  spotify: siSpotify,
};

export default function ServiceLogo({ name, className = '' }) {
  const icon = brandIcons[normalizeName(name)];

  if (!icon) {
    return (
      <span
        className={[
          'flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500',
          className,
        ].join(' ')}
        aria-hidden="true"
      >
        <Dumbbell size={20} />
      </span>
    );
  }

  return (
    <span
      className={['flex size-11 items-center justify-center rounded-2xl bg-slate-100', className].join(' ')}
      title={icon.title}
      aria-label={`${icon.title} logo`}
    >
      <svg role="img" viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <path fill={`#${icon.hex}`} d={icon.path} />
      </svg>
    </span>
  );
}

function normalizeName(name) {
  return name.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}
