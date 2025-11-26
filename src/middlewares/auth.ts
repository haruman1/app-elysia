import { Elysia } from 'elysia';

export const authMiddleware = new Elysia()
  .derive(async ({ jwt, request }) => {
    const auth = request.headers.get('authorization');

    if (!auth || !auth.startsWith('Bearer ')) return { user: null };

    const token = auth.split(' ')[1];

    try {
      const payload = await jwt.verify(token);
      return { user: payload };
    } catch {
      return { user: null };
    }
  })

  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        success: false,
        message: 'Token tidak valid atau belum dikirim',
      };
    }
  });
