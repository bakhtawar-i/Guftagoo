import type { ReactNode } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';

const labelClass = 'mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]';
const inputClass =
  'focus-ring w-full rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3.5 text-[#1c214a] outline-none transition placeholder:text-[#a5a0a0] focus:border-[#1d9fb6]';
const chipClass =
  'flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-3.5 py-3 text-sm text-[#1c214a] transition hover:border-[#1d9fb6] has-[:checked]:border-[#1d9fb6] has-[:checked]:bg-[#e7f5f2]';

export const toTestId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function SignupDialog({ titleId, onClose, children }: { titleId: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c214a]/55 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-[540px] overflow-hidden rounded-[28px] bg-[#f9f5eb] p-7 shadow-2xl sm:p-10">
          <button onClick={onClose} className="focus-ring absolute right-5 top-5 rounded-full p-2 text-[#1c214a]/60 transition hover:bg-[#1c214a]/8 hover:text-[#1c214a]" aria-label="Close signup" data-testid="button-close-signup"><X size={20} /></button>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeading({ eyebrow, title, titleId, children }: { eyebrow: string; title: string; titleId: string; children: ReactNode }) {
  return (
    <div className="mb-8 max-w-sm">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#1d9fb6]">{eyebrow}</span>
      <h2 id={titleId} className="mt-3 font-serif text-[42px] leading-[.95] text-[#1c214a]">{title}</h2>
      <p className="mt-4 text-[15px] leading-6 text-[#52536a]">{children}</p>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  testId: string;
  type?: 'text' | 'email' | 'url';
  autoComplete?: string;
  hint?: string;
};

export function TextField({ label, value, onChange, placeholder, testId, type = 'text', autoComplete, hint }: TextFieldProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className={inputClass} placeholder={placeholder} data-testid={testId} />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-[#777487]">{hint}</span>}
    </label>
  );
}

type SelectFieldProps<T extends string> = {
  label: string;
  value: T | '';
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  placeholder: string;
  testId: string;
};

export function SelectField<T extends string>({ label, value, onChange, options, placeholder, testId }: SelectFieldProps<T>) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select required value={value} onChange={(event) => onChange(event.target.value as T)} className={`${inputClass} appearance-none`} data-testid={testId}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

type ChoiceGroupProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (option: T, checked: boolean) => void;
  multiple: boolean;
  testIdPrefix: string;
};

/** Tappable option chips: checkboxes when `multiple`, radio buttons otherwise. */
export function ChoiceGroup<T extends string>({ legend, name, options, selected, onToggle, multiple, testIdPrefix }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="block">
      <legend className={labelClass}>{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className={chipClass}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option}
              checked={selected.includes(option)}
              onChange={(event) => onToggle(option, event.target.checked)}
              className="h-4 w-4 accent-[#1d9fb6]"
              data-testid={`${testIdPrefix}-${toTestId(option)}`}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TickBox({ checked, onChange, testId, children }: { checked: boolean; onChange: (checked: boolean) => void; testId: string; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#1c214a]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#1d9fb6]" data-testid={testId} />
      <span>{children}</span>
    </label>
  );
}

export function TextAreaField({ label, value, onChange, maxLength, placeholder, testId }: { label: string; value: string; onChange: (value: string) => void; maxLength: number; placeholder: string; testId: string }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} rows={3} className={`${inputClass} resize-none`} placeholder={placeholder} data-testid={testId} />
      <span className="mt-1.5 block text-right text-xs text-[#777487]">{value.length}/{maxLength}</span>
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-xl border border-[#c86a62]/35 bg-[#fff0ec] px-4 py-3 text-sm leading-5 text-[#9d4038]" role="alert" data-testid="text-signup-error">{message}</p>;
}

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#1c214a] px-5 py-4 font-semibold text-[#f9f5eb] transition hover:-translate-y-0.5 hover:bg-[#252b60] disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-signup">
      {pending ? 'Saving your place…' : label} {!pending && <ArrowUpRight size={17} />}
    </button>
  );
}

export function SignupSuccess({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="py-10 text-center" data-testid="panel-signup-success">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#bfe9e7] text-[#1c214a]"><Check size={28} strokeWidth={2.5} /></div>
      <h2 className="mt-7 font-serif text-[44px] leading-none text-[#1c214a]">{title}</h2>
      <p className="mx-auto mt-4 max-w-sm text-[15px] leading-6 text-[#52536a]">{children}</p>
      <button onClick={onClose} className="focus-ring mt-8 rounded-full border border-[#1c214a] px-6 py-3 text-sm font-semibold text-[#1c214a] transition hover:bg-[#1c214a] hover:text-[#f9f5eb]" data-testid="button-finish-signup">Back to Guftagoo</button>
    </div>
  );
}
