import type { FieldError, FieldValues, Path } from "react-hook-form";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";

const FIELD_CLASS =
  "w-full rounded-lg border border-bone/14 bg-ink-2 px-4 py-3 text-[15px] text-bone " +
  "placeholder:text-bone/35 outline-none transition-colors duration-300 " +
  "focus:border-gold/60 hover:border-bone/26";

const LABEL_CLASS = "mb-2 block text-[10px] uppercase tracking-[0.24em] text-bone/60";

/** Inline error/hint line. Same voice as the field labels, quieter weight. */
function FieldNote({ error, hint }: { error?: FieldError; hint?: ReactNode }) {
  if (error) {
    return (
      <p className="mt-2 text-[12px] text-[#d98a7a]" role="alert">
        {error.message}
      </p>
    );
  }
  if (hint !== undefined && hint !== null && hint !== "")
    return <p className="mt-2 text-[12px] text-bone/45">{hint}</p>;
  return null;
}

type TextProps<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>> = {
  label: string;
  name: TName;
  error?: FieldError;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

export function TextField<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>>({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: TextProps<TFieldValues, TName>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        name={name.toString()}
        aria-invalid={Boolean(error)}
        className={cn(FIELD_CLASS, className)}
        {...rest}
      />
      <FieldNote error={error} hint={hint} />
    </div>
  );
}

type TextareaProps = {
  label: string;
  name: string;
  error?: FieldError;
  hint?: ReactNode;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export function TextareaField({ label, name, error, hint, className, ...rest }: TextareaProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(FIELD_CLASS, "min-h-28 resize-y", className)}
        {...rest}
      />
      <FieldNote error={error} hint={hint} />
    </div>
  );
}

type SelectOption = { value: string; label: string };

type SelectProps = {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  error?: FieldError;
  hint?: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "children">;

export function SelectField({
  label,
  name,
  options,
  placeholder,
  error,
  hint,
  className,
  ...rest
}: SelectProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(FIELD_CLASS, "appearance-none", className)}
        {...rest}
      >
        {placeholder !== undefined && placeholder !== "" ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldNote error={error} hint={hint} />
    </div>
  );
}
