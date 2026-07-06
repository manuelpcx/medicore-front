# MediHistory Frontend

Interfaz web para **MediHistory** — historial médico personal centralizado.

## Stack

- **React 18** + TypeScript + Vite
- **React Router v6** (rutas protegidas)
- **TanStack Query v5** (fetching, cache, mutations)
- **Axios** con interceptores JWT + auto-refresh
- **React Hook Form** + Zod (formularios y validación)
- **Zustand** (estado global: auth, toasts)
- **date-fns** (formateo de fechas en español)
- **Recharts** (gráficos del panel de administración)
- CSS inline / variables CSS (sin librerías de UI)

---

## Inicio rápido

> Este proyecto usa **pnpm** (es el gestor con el que se despliega). Usa siempre `pnpm` para instalar dependencias, no `npm`, para mantener `pnpm-lock.yaml` sincronizado.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar en desarrollo
pnpm dev
# → http://localhost:5173
```

> Asegúrate de que el backend MediHistory esté corriendo en `http://localhost:3000`

---

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL base del backend |

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión |
| `/register` | Registro de nuevo paciente |
| `/dashboard` | Resumen: signos vitales, consultas recientes, medicamentos, alergias |
| `/historial` | Historial clínico con filtros y timeline |
| `/medicamentos` | Gestión de medicamentos (activos / anteriores) |
| `/examenes` | Subida y visualización de exámenes con archivos |
| `/alergias` | Registro de alergias con indicadores de severidad |
| `/vacunas` | Registro de vacunas con alertas de próxima dosis |
| `/perfil` | Editar datos personales, signos vitales y contacto de emergencia |

---

## Funcionalidades clave

### JWT con auto-refresh
El interceptor de Axios detecta respuestas 401, intenta renovar el `access_token` con el `refresh_token` almacenado, y reintenta la petición original. Si el refresh falla, redirige a `/login`.

### Modal QR
Desde el sidebar el botón **"Compartir QR"** genera un código de 8 caracteres válido 10 minutos con cuenta regresiva animada y botón de revocación.

### Toasts globales
Notificaciones de éxito/error automáticas desde las mutations de TanStack Query. Componente propio, sin dependencias externas.

---

## Estructura

```
src/
├── api/            # Clientes Axios por módulo
├── components/
│   ├── layout/     # Sidebar + AppLayout
│   ├── modals/     # QRModal
│   └── ui/         # Button, Card, Badge, Input, Modal, Toast, Skeleton, FileUpload
├── hooks/          # Custom hooks con TanStack Query
├── pages/          # Una página por sección
├── router/         # AppRouter + ProtectedRoute + PublicOnlyRoute
├── store/          # Zustand: auth.store, toast.store
├── types/          # Interfaces TypeScript
└── utils/          # format.ts (fechas, errores)
```

---

## Usuario demo (seed del backend)

| Email | Password |
|---|---|
| `jesus.mendez@demo.com` | `Demo1234!` |
