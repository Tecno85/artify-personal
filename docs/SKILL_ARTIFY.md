# Skill: Artify - Buenas Prácticas del Proyecto

Este documento resume cómo trabajar en Artify sin repetir la documentación técnica del proyecto.

---

## Alcance

Este skill aplica al proyecto completo:
- Backend `Node.js + Express`
- Frontend `HTML + CSS + JavaScript Vanilla`
- Base de datos `MySQL`
- Documentación y control de versiones

---

## Fuentes de verdad

- `CONTEXT.md`: estado actual del proyecto, estructura real, endpoints y flujos activos.
- `README.md`: instalación, arranque y uso.
- `docs/CODING_STANDARDS.md`: normas de código, comentarios y convenciones.

---

## Panorama actual

Artify ya está organizado con:
- `frontend/` para la interfaz visual
- `backend/` modular para rutas, controladores, middlewares y utilidades
- `database/` para el script SQL
- `docs/` para documentación técnica y guía de trabajo

La autenticación actual usa un token firmado por backend y `sessionStorage` en el frontend.

---

## Buenas prácticas de trabajo

- Mantener secretos y credenciales fuera del repositorio.
- Respetar la separación entre frontend, backend y base de datos.
- Usar `README.md` para instalación y `CONTEXT.md` para el estado real.
- Revisar `docs/CODING_STANDARDS.md` antes de tocar estilo o comentarios.
- Usar mensajes de commit en formato `tipo(scope): descripción`.

---

## Contrato común

Cuando cambies respuestas de API, conservar la estructura esperada por el proyecto:

```json
{
  "ok": true,
  "mensaje": "Texto legible",
  "data": {}
}
```

Para errores, seguir el mismo patrón con `ok: false` y `mensaje` claro.

---

## Entorno y seguridad

- El archivo `.env` no se sube.
- `.env.example` debe reflejar las variables mínimas necesarias.
- No hardcodear credenciales, tokens ni cadenas de conexión.
- Validar siempre en backend, aunque el frontend también valide.

---

## Trabajo futuro

La evolución del proyecto debe ir en una sección separada del estado actual.

Prioridades futuras sugeridas:
- pruebas automatizadas para login, CRUD y analytics
- fortalecimiento de seguridad y expiración de tokens
- mejoras de despliegue y monitoreo

---

## Mantenimiento

- Si cambian rutas, endpoints o estructura real, actualizar `CONTEXT.md` primero.
- Si cambian reglas de estilo, actualizar `docs/CODING_STANDARDS.md`.
- Si cambia la forma de trabajar, reflejarlo aquí sin duplicar el árbol completo del proyecto.

