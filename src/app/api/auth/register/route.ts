import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, signRefreshToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'client', // Rol por defecto es cliente
      },
    });

    // Crear sesión (JWT Tokens)
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Guardar token en las cookies
    const response = NextResponse.json(
      {
        message: 'Registro exitoso',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
