import { api } from './client'
import type { AuthResult, LoginPayload, RegisterPayload, User } from '@/types/api'

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const { data } = await api.post<AuthResult>('/auth/register', payload)
    return data
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await api.post<AuthResult>('/auth/login', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}
