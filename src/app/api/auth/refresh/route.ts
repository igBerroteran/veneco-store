import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, signToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token no proporcionado' },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Refresh token inválido o expirado' },
        { status: 401 }
      );
    }

    // Generar nuevo access token
    const newAccessToken = signToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    });

    const response = NextResponse.json({
      message: 'Token refrescado exitosamente',
      user: { id: payload.id, email: payload.email, name: payload.name, role: payload.role },
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('token', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor al refrescar token' },
      { status: 500 }
    );
  }
}
