import { Boxes } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setFormError(null)

    if (email.trim().length === 0 || password.length === 0) {
      setFormError('Escribe tu correo y contraseña.')
      return
    }

    setIsSubmitting(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      // No manual redirect: the route guard sends us in once the session exists.
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo iniciar sesión.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="YaLoTengo"
      subtitle="Sabe qué tienes en casa y dónde lo guardaste."
      brand
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />

        {formError ? <p className="text-sm text-danger-500">{formError}</p> : null}

        <Button type="submit" size="lg" block loading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-accent">
          Crear una
        </Link>
      </p>
    </AuthShell>
  )
}

/** Shared frame for login and register, so both screens are identical in rhythm. */
export function AuthShell({
  title,
  subtitle,
  brand = false,
  children,
}: {
  title: string
  subtitle: string
  brand?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          {brand ? (
            <div className="mb-2 grid size-14 place-items-center rounded-card bg-accent-soft">
              <Boxes className="size-7 text-accent" aria-hidden />
            </div>
          ) : null}
          <h1 className="text-2xl font-bold text-content">{title}</h1>
          <p className="text-sm text-content-muted">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
