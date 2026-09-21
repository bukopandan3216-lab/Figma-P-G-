import React, { useState, useRef, useEffect } from 'react';
import { X, Check, AlertCircle, Info, ChevronDown, ChevronUp, Search } from 'lucide-react';

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'rose';
const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  muted: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  rose: 'bg-[var(--rose-light)] text-[var(--rose)]',
};
export function Badge({ variant = 'default', className = '', children }: { variant?: BadgeVariant; className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide ${badgeStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';
const btnVariantStyles: Record<BtnVariant, string> = {
  primary: 'bg-[var(--primary)] text-white hover:bg-[#9E5569] active:bg-[#8B4A5B] shadow-sm',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]',
  outline: 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]',
  ghost: 'text-[var(--foreground)] hover:bg-[var(--secondary)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
const btnSizeStyles: Record<BtnSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};
export function Button({
  variant = 'primary', size = 'md', disabled, loading, className = '', children, onClick, type = 'button',
}: {
  variant?: BtnVariant; size?: BtnSize; disabled?: boolean; loading?: boolean; className?: string;
  children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${btnVariantStyles[variant]} ${btnSizeStyles[size]} ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  label, error, hint, icon, className = '', ...props
}: {
  label?: string; error?: string; hint?: string; icon?: React.ReactNode; className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">{icon}</span>}
        <input
          {...props}
          className={`w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({
  label, error, options, className = '', ...props
}: {
  label?: string; error?: string; options: { value: string; label: string }[]; className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        {...props}
        className={`w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all ${error ? 'border-red-500' : ''}`}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className = '', children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} bg-[var(--card)] rounded-[var(--radius-xl)] shadow-2xl animate-fade-in max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-md p-1 hover:bg-[var(--muted)]"><X size={18} /></button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastData = { id: string; type: 'success' | 'error' | 'info'; message: string };
export function ToastContainer({ toasts, onRemove }: { toasts: ToastData[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] shadow-lg text-sm font-medium animate-fade-in ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-[var(--slate-admin)] text-white'}`}>
          {t.type === 'success' ? <Check size={16} /> : t.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const add = (type: ToastData['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, add, remove };
}

// ─── Table ────────────────────────────────────────────────────────────────────
export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}
export function DataTable<T extends Record<string, unknown>>({
  columns, data, emptyMessage = 'No records found',
}: {
  columns: Column<T>[]; data: T[]; emptyMessage?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = data.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const rows = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search…"
          className="w-full pl-8 pr-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && toggleSort(String(col.key))}
                  className={`px-4 py-3 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide whitespace-nowrap ${col.sortable !== false ? 'cursor-pointer hover:text-[var(--foreground)] select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === String(col.key) && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--muted-foreground)]">{emptyMessage}</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors">
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-[var(--foreground)]">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--secondary)]">←</button>
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 rounded border ${p === page ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--secondary)]'}`}>{p}</button>
          ))}
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--secondary)]">→</button>
        </div>
      </div>
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${i < current ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : i === current ? 'bg-white border-[var(--primary)] text-[var(--primary)]' : 'bg-white border-[var(--border)] text-[var(--muted-foreground)]'}`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${i === current ? 'text-[var(--primary)]' : i < current ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mb-5 transition-colors ${i < current ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      {icon && <div className="text-[var(--muted-foreground)] mb-1">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
      {description && <p className="text-sm text-[var(--muted-foreground)] max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex border-b border-[var(--border)] gap-0">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active === tab ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`h-2 bg-[var(--muted)] rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>/</span>}
          {item.href ? <a href={item.href} className="hover:text-[var(--foreground)] transition-colors">{item.label}</a> : <span className="text-[var(--foreground)] font-medium">{item.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ─── Range Slider ─────────────────────────────────────────────────────────────
export function RangeSlider({ min, max, value, onChange, label }: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void; label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={value[1]} onChange={e => onChange([min, +e.target.value])} className="w-full accent-[var(--primary)]" />
      </div>
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>${value[0]}</span><span>${value[1]}</span>
      </div>
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}
      >
        {checked && <Check size={10} className="text-white" />}
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
