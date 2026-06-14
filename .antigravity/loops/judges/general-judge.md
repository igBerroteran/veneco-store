# Rúbrica de Verificación General: Compilación y Calidad de Código

Evalúa de forma estricta los resultados del ciclo de refactorización según los siguientes criterios:

1. [ ] ¿El comando `npm run lint` devuelve un código de salida 0 con cero errores y warnings?
2. [ ] ¿El comando `npm run build` compila con éxito la base de datos (Prisma generation) y la aplicación Next.js sin errores de TypeScript?
3. [ ] ¿Se han mantenido intactos los estilos CSS vainilla y se ha evitado la introducción de frameworks CSS no solicitados?
4. [ ] ¿Se han documentado todos los cambios, aciertos y aprendizajes nuevos en el archivo `MEMORY.md`?

Si alguno de estos puntos falla, el veredicto es **RECHAZADO**. Devuelve el log completo del error obtenido para que el agente ejecutor pueda corregirlo.
