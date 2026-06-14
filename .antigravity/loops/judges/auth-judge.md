# Rúbrica de Verificación: Módulo de Autenticación y JWT

Evalúa el módulo de autenticación del sistema según los siguientes estándares:

1. [ ] ¿El comando `npm run lint` finaliza con éxito?
2. [ ] ¿El build de Next.js (`npm run build`) se ejecuta sin errores de compilación ni de tipos en rutas de API de auth (`src/app/api/auth`)?
3. [ ] ¿Los tokens JWT de sesión se generan e inyectan usando cookies HTTP-Only (`HttpOnly`), con los flags de seguridad `Secure` y `SameSite=Strict` activos?
4. [ ] ¿Las contraseñas de los usuarios se almacenan aplicando cifrado asíncrono robusto (ej. usando la librería `bcryptjs` del stack)?
5. [ ] ¿Se valida la existencia del usuario en la base de datos antes de generar nuevos tokens para evitar sesiones huérfanas en reset de DB?

Si alguno de estos puntos falla, el veredicto es **RECHAZADO**. Reporta el error exacto al agente ejecutor.
