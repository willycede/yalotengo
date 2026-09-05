import { FolderOpen } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { getErrorMessage } from '@/api/client'
import { CategoryCard } from '@/components/CategoryCard'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback'
import { Fab } from '@/components/ui/Fab'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useCategoriesStore } from '@/store/categoriesStore'
import { toast } from '@/store/toastStore'

export function CategoriesPage() {
  const { items, isLoading, hasLoaded, error, fetch, create } = useCategoriesStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void fetch()
  }, [fetch])

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setFormError(null)

    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setFormError('Escribe un nombre para la categoría.')
      return
    }

    setIsSaving(true)
    try {
      await create(trimmed)
      toast.success('Categoría creada')
      setName('')
      setIsModalOpen(false)
    } catch (createError) {
      setFormError(getErrorMessage(createError, 'No se pudo crear la categoría.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        subtitle={items.length > 0 ? `${items.length} en total` : undefined}
      />

      <PageBody>
        {isLoading && !hasLoaded ? (
          <LoadingState label="Cargando categorías…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void fetch(true)} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Aún no tienes categorías"
            description="Crea una categoría como Navidad o Cocina para empezar a organizar tus cosas."
            action={<Button onClick={() => setIsModalOpen(true)}>Crear categoría</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </PageBody>

      <Fab label="Crear categoría" onClick={() => setIsModalOpen(true)} />

      <Modal
        open={isModalOpen}
        title="Nueva categoría"
        onClose={() => {
          setIsModalOpen(false)
          setFormError(null)
        }}
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Navidad"
            maxLength={100}
            autoFocus
            error={formError ?? undefined}
            hint="Agrupa por temporada o lugar: Navidad, Cocina, Garaje…"
          />

          <Button type="submit" size="lg" block loading={isSaving}>
            Crear categoría
          </Button>
        </form>
      </Modal>
    </>
  )
}
