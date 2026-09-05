import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth, RequireGuest } from '@/components/RouteGuards'
import { Toaster } from '@/components/ui/Toaster'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { CategoryDetailPage } from '@/pages/CategoryDetailPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { ProductEditPage } from '@/pages/ProductEditPage'
import { ProductNewPage } from '@/pages/ProductNewPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const restore = useAuthStore((state) => state.restore)

  // Validate any stored token once, on boot.
  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/categorias/:id" element={<CategoryDetailPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/nuevo" element={<ProductNewPage />} />
            <Route path="/productos/:id" element={<ProductDetailPage />} />
            <Route path="/productos/:id/editar" element={<ProductEditPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Categories is the home screen: it's where organising starts. */}
        <Route path="*" element={<Navigate to="/categorias" replace />} />
      </Routes>

      <Toaster />
    </BrowserRouter>
  )
}
