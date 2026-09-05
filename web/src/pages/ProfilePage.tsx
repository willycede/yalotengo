import { LogOut, Mail } from 'lucide-react'
import { useState } from 'react'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useCategoriesStore } from '@/store/categoriesStore'
import { useProductsStore } from '@/store/productsStore'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const categoryCount = useCategoriesStore((state) => state.items.length)
  const productTotal = useProductsStore((state) => state.total)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const initial = user?.name.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <>
      <PageHeader title="Perfil" />

      <PageBody>
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-accent-soft text-2xl font-bold text-accent">
              {initial}
            </div>
            <h2 className="text-lg font-bold text-content">{user?.name ?? '—'}</h2>
            <p className="flex items-center gap-1.5 text-sm text-content-muted">
              <Mail className="size-4" aria-hidden />
              {user?.email ?? '—'}
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Categorías" value={categoryCount} />
            <StatCard label="Productos" value={productTotal} />
          </div>

          <Button
            variant="danger"
            size="lg"
            block
            icon={<LogOut className="size-4" />}
            onClick={() => setIsConfirmOpen(true)}
          >
            Cerrar sesión
          </Button>
        </div>
      </PageBody>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Cerrar sesión"
        description="¿Seguro que quieres salir de tu cuenta?"
        confirmLabel="Salir"
        onConfirm={logout}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-content tabular-nums">{value}</p>
      <p className="text-sm text-content-muted">{label}</p>
    </Card>
  )
}
