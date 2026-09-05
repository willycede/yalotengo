import { ChevronRight, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from './ui/Card'
import type { Category } from '@/types/api'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Card interactive>
      <Link to={`/categorias/${category.id}`} className="flex items-center gap-3 p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-control bg-accent-soft">
          <Folder className="size-5 text-accent" aria-hidden />
        </div>
        <span className="min-w-0 flex-1 truncate font-semibold text-content">{category.name}</span>
        <ChevronRight className="size-5 shrink-0 text-content-muted" aria-hidden />
      </Link>
    </Card>
  )
}
