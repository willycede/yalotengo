import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from './ui/Feedback'
import { useAuthStore } from '@/store/authStore'

/**
 * Both guards wait for `restore()` to finish so a valid session never flashes
 * the login screen on reload.
 */

export function RequireAuth() {
  const user = useAuthStore((state) => state.user)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  if (isRestoring) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireGuest() {
  const user = useAuthStore((state) => state.user)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  if (isRestoring) return <FullScreenLoader />
  if (user) return <Navigate to="/categorias" replace />
  return <Outlet />
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LoadingState label="Abriendo tu inventario…" />
    </div>
  )
}
