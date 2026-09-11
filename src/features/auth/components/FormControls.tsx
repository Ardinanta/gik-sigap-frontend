import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  helper?: string
  children: ReactNode
}

function FieldShell({ id, label, error, helper, children }: FieldShellProps) {
  const descriptionId = error || helper ? `${id}-description` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {(error || helper) && <p id={descriptionId} className={error ? 'field-error' : 'field-helper'}>{error ?? helper}</p>}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helper?: string
  icon?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helper, icon, id, className = '', ...props }, ref) => {
    const fieldId = id ?? props.name
    if (!fieldId) return null

    return (
      <FieldShell id={fieldId} label={label} error={error} helper={helper}>
        <div className={`input-wrap${error ? ' has-error' : ''}`}>
          {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
          <input
            {...props}
            id={fieldId}
            ref={ref}
            className={`${icon ? 'with-icon ' : ''}${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helper ? `${fieldId}-description` : undefined}
          />
        </div>
      </FieldShell>
    )
  },
)

type PasswordFieldProps = Omit<TextFieldProps, 'type'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({
  label,
  error,
  helper,
  icon,
  id,
  name,
  ...inputProps
}, ref) => {
  const [visible, setVisible] = useState(false)
  const fieldId = id ?? name
  if (!fieldId) return null

  return (
    <FieldShell id={fieldId} label={label} error={error} helper={helper}>
      <div className={`input-wrap${error ? ' has-error' : ''}`}>
        {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
        <input
          {...inputProps}
          id={fieldId}
          name={name}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`${icon ? 'with-icon ' : ''}with-action`}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helper ? `${fieldId}-description` : undefined}
        />
        <button
          className="input-action"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  )
})

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  helper?: string
  children: ReactNode
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helper, children, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    if (!fieldId) return null

    return (
      <FieldShell id={fieldId} label={label} error={error} helper={helper}>
        <div className={`input-wrap${error ? ' has-error' : ''}`}>
          <select
            {...props}
            id={fieldId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helper ? `${fieldId}-description` : undefined}
          >{children}</select>
        </div>
      </FieldShell>
    )
  },
)

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button className="button-primary" type="submit" disabled={loading}>
      {loading && <LoaderCircle className="spinner" size={18} aria-hidden="true" />}
      {children}
    </button>
  )
}

export function FormAlert({ variant = 'error', children }: { variant?: 'error' | 'success' | 'info'; children: ReactNode }) {
  return <div className={`form-alert ${variant}`} role={variant === 'error' ? 'alert' : 'status'}>{children}</div>
}
