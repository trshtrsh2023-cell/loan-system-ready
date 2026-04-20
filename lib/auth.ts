import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
export const COOKIE = 'auth_token'

export interface AuthUser {
  id: string
  username: string
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected'
  request_id: string
}

export async function signToken(payload: AuthUser) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
