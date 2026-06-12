# TP Previo Parcial 2 — DDS 2026 — Curso 3K3

## Integrantes
| Nombre | Legajo |
|---|---|
| Bartolomé de la Colina | 409001 |
| Bruno Astori | 409276 |

---

## Requisitos previos
- Node.js v18+
- npm

---

## Instalación y ejecución

### Backend
```bash
cd backend
npm install
npm run seed       # carga los datos iniciales
npm start          # inicia el servidor en http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # inicia el cliente en http://localhost:5173
```

---

## Usuarios de prueba

| Nombre | Email | Contraseña | Rol |
|---|---|---|---|
| Admin General | admin@dds.com | 123456 | admin |
| Carlos Gómez | carlos@dds.com | 123456 | encargado |
| Carla Ruiz | carla@dds.com | 123456 | usuario |
| Juan Pérez | juan@dds.com | 123456 | usuario |

---

## Endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión, devuelve JWT |

### Equipos
| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/equipos | Listar todos los equipos |

### Solicitudes
| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/solicitudes | Listar con filtros opcionales (requiere autenticación) |
| GET | /api/solicitudes/resumen | Panel resumen (admin/encargado) |
| GET | /api/solicitudes/:id | Detalle de una solicitud |
| GET | /api/solicitudes/:id/historial | Historial de cambios |
| POST | /api/solicitudes | Crear solicitud |
| PUT | /api/solicitudes/:id | Editar solicitud pendiente |
| PATCH | /api/solicitudes/:id/cancelar | Cancelar solicitud propia |
| PATCH | /api/solicitudes/:id/aprobar | Aprobar solicitud (admin/encargado) |
| PATCH | /api/solicitudes/:id/rechazar | Rechazar solicitud (admin/encargado) |
| PATCH | /api/solicitudes/:id/devolver | Marcar como devuelta (admin/encargado) |

### Filtros disponibles en GET /api/solicitudes
| Param | Descripción |
|---|---|
| estado | pendiente, aprobada, rechazada, cancelada, devuelta |
| equipoId | ID del equipo |
| categoria | notebook, proyector, cámara, kit de red |
| desde | Fecha de retiro desde (YYYY-MM-DD) |
| hasta | Fecha de retiro hasta (YYYY-MM-DD) |
| page | Número de página (default: 1) |
| limit | Resultados por página (default: 10) |
| sortBy | Campo por el que ordenar (default: createdAt) |
| order | ASC o DESC (default: DESC) |

---

## Rutas del frontend

| Ruta | Descripción | Roles |
|---|---|---|
| /login | Iniciar sesión | Público |
| /register | Registrarse | Público |
| /solicitudes | Listado con filtros y paginación | Todos |
| /solicitudes/nueva | Crear solicitud | Todos |
| /solicitudes/:id | Detalle con historial y acciones | Todos |
| /solicitudes/:id/editar | Editar solicitud pendiente | Propietario |
| /resumen | Panel administrativo | Admin / Encargado |
| * | Página 404 | — |

---

## Disponibilidad de equipos y autorización

Un equipo se considera **disponible** cuando su estado es `disponible` y no tiene ninguna solicitud con estado `aprobada` cuyas fechas se superpongan con el período solicitado.

Solo las solicitudes **aprobadas** bloquean disponibilidad. Las solicitudes pendientes no bloquean pero pueden generar conflicto al intentar aprobar.

Cuando una solicitud se **aprueba**, el equipo pasa a estado `prestado`. Cuando se **devuelve**, vuelve a `disponible`.

---

## JWT, roles y permisos

Al iniciar sesión correctamente el backend devuelve un JWT firmado con el `id`, `email` y `rol` del usuario. El token tiene una validez de 8 horas.

El frontend almacena el token en `localStorage` y lo adjunta automáticamente en el header `Authorization: Bearer <token>` en cada request protegido mediante un interceptor de Axios.

### Roles
| Rol | Permisos |
|---|---|
| usuario | Crear solicitudes, ver sus propias solicitudes, cancelar las propias |
| encargado | Todo lo anterior + ver todas las solicitudes, aprobar, rechazar y marcar devolución |
| admin | Igual que encargado |

Las rutas protegidas devuelven:
- `401` si no se envía token
- `403` si el usuario no tiene el rol requerido

---

## Pruebas automatizadas

```bash
cd backend
npm test
```

Los tests cubren:
1. Login correcto e inválido
2. Listado de solicitudes con y sin filtros (requiere autenticación)
3. Detalle de solicitud existente e inexistente
4. Creación válida de una solicitud
5. Creación inválida por fechas inconsistentes
6. Creación inválida por equipo no disponible o superposición
7. Acceso sin JWT a ruta protegida
8. Acceso con rol insuficiente
9. Devolución de solicitud no aprobada
10. Transición de estado no permitida

Cada test usa una base de datos SQLite separada (`test.db`) que se reinicia antes de cada ejecución para garantizar aislamiento.

---

## Estructura del proyecto

```
backend/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── tests/
└── app.js

frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   └── services/
└── index.html
```

---

## Decisiones técnicas

- **Persistencia:** SQLite con Sequelize ORM. Los datos se conservan al reiniciar el servidor.
- **Contraseñas:** hasheadas con bcrypt mediante hooks del modelo de Sequelize antes de persistir.
- **Historial:** se registra automáticamente en cada cambio de estado (creación, aprobación, rechazo, cancelación, devolución, edición).
- **Validaciones:** implementadas en los servicios del backend como fuente de verdad, y replicadas en el frontend para mejor experiencia de usuario.

## Limitaciones conocidas

- Los usuarios del seed tienen contraseñas en texto plano que son hasheadas al correr `npm run seed`. Las contraseñas de prueba están documentadas en la tabla de usuarios de prueba.
- La base de datos de tests (`test.db`) se elimina y recrea en cada ejecución de `npm test`, por lo que no persiste datos entre corridas.