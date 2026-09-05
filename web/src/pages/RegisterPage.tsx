import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from './LoginPage'
import { getErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

/** Mirrors the backend rule (`registerSchema`) so we fail fast without a round trip. */
const MIN_PASSWORD_LENGTH = 8

export function RegisterPage() {
  const register = useAuthStore((state) => state.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setFormError(null)

    if (name.trim().length === 0) {
      setFormError('Escribe tu nombre.')
      return
    }
    if (email.trim().length === 0) {
      setFormError('Escribe tu correo.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password })
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo crear la cuenta.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell title="Crear cuenta" subtitle="Empieza a ordenar lo que tienes en casa.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
        />

        <Input
          label="Correo"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tucorreo@ejemplo.com"
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
        />

        {formError ? <p className="text-sm text-danger-500">{formError}</p> : null}

        <Button type="submit" size="lg" block loading={isSubmitting}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-accent">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
