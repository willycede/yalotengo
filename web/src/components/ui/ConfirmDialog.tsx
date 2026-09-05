import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Replaces `window.confirm` so destructive actions look like the rest of the app. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-content-muted">{description}</p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} block className="sm:w-auto">
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} block className="sm:w-auto">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
