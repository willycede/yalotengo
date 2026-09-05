import { ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/Button'

export interface PhotoSelection {
  /** Existing remote URL, kept when the user doesn't touch the photo. */
  url: string | null
  /** Newly picked file, still to upload. */
  file: File | null
}

interface PhotoPickerProps {
  value: PhotoSelection
  onChange: (value: PhotoSelection) => void
}

/** Kept in sync with the API's upload middleware. */
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Object URLs must be revoked or the blob leaks for the page's lifetime.
  useEffect(() => {
    if (!value.file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(value.file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [value.file])

  const shownImage = previewUrl ?? value.url

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-content-muted">Foto</span>

      <div className="flex items-center gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-control border border-line bg-surface">
          {shownImage ? (
            <img src={shownImage} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-7 text-content-muted" aria-hidden />
          )}
        </div>

        <div className="flex flex-1 flex-wrap gap-2">
          {/* On phones this opens the camera or gallery chooser natively. */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return

              // Mirrors the API's upload middleware so we fail fast, before the
              // user waits on an upload that would be rejected anyway.
              if (!ALLOWED_TYPES.has(file.type)) {
                setFileError('La foto debe ser JPEG, PNG o WebP.')
                return
              }
              if (file.size > MAX_FILE_SIZE) {
                setFileError('La foto no puede pesar más de 5 MB.')
                return
              }

              setFileError(null)
              onChange({ url: value.url, file })
            }}
          />

          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            {shownImage ? 'Cambiar' : 'Elegir foto'}
          </Button>

          {shownImage ? (
            <Button
              type="button"
              variant="ghost"
              icon={<Trash2 className="size-4" />}
              onClick={() => {
                onChange({ url: null, file: null })
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              Quitar
            </Button>
          ) : null}
        </div>
      </div>

      {fileError ? (
        <p className="text-sm text-danger-500">{fileError}</p>
      ) : (
        <p className="text-sm text-content-muted">JPEG, PNG o WebP. Máximo 5 MB.</p>
      )}
    </div>
  )
}
