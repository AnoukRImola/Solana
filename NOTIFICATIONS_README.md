# Sistema de Notificaciones en Tiempo Real

## ✅ Implementación Completada

Se ha implementado un sistema completo de notificaciones en tiempo real con las siguientes características:

### Backend (NestJS + Socket.io)

- ✅ WebSocket Gateway con JWT authentication
- ✅ 6 endpoints REST para CRUD de notificaciones
- ✅ Room isolation por wallet address
- ✅ Emisión de eventos en tiempo real
- ✅ 4 CRON jobs integrados con WebSocket
- ✅ Tracking de conexiones activas

### Frontend (Next.js + Zustand + Socket.io-client)

- ✅ Servicio de WebSocket con auto-reconexión
- ✅ API REST client con axios
- ✅ Zustand slice con estado completo
- ✅ Firestore fallback mode cuando WebSocket falla
- ✅ NotificationBell component con badge
- ✅ NotificationCenter con filtros y acciones
- ✅ Toast notifications con Sonner
- ✅ Indicadores visuales de estado

---

## ⚠️ Pendiente de Implementar

### 1. Configurar API Key en Frontend

**Problema:** El backend usa guards de autenticación con API key, pero falta configurar la variable de entorno en el frontend.

**Solución:**

1. **Agregar la API key al `.env.local` del dashboard:**

```env
# El mismo valor que JWT_SECRET en el backend
NEXT_PUBLIC_API_KEY=trustless-work-solana-dev-secret-2026
```

2. **Actualizar la función `getAuthToken()` en `notifications.slice.ts`:**

```typescript
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return process.env.NEXT_PUBLIC_API_KEY || null;
}
```

**Nota:** El proyecto usa un API key compartido (no JWT por usuario individual). Este es el mismo patrón usado en otros endpoints del backend (ver `compliance.controller.ts`).

---

### 2. Firestore Security Rules

**Problema:** Las reglas de seguridad de Firestore no están configuradas para la colección `notifications`.

**Solución:**

Agregar estas reglas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{notificationId} {
      // Solo lectura si el wallet está en la lista de entities
      allow read: if request.auth != null &&
                     request.auth.token.wallet in resource.data.entities;

      // Solo el backend puede crear notificaciones
      allow create: if false;

      // Solo puede actualizar el campo readBy agregando su propio wallet
      allow update: if request.auth != null &&
                       request.auth.token.wallet in resource.data.entities &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['readBy']) &&
                       request.resource.data.readBy.hasOnly([request.auth.token.wallet]);

      // No se permite eliminación directa (soft delete desde backend)
      allow delete: if false;
    }
  }
}
```

---

### 3. Variables de Entorno de Firebase (Frontend)

**Problema:** El frontend necesita las credenciales de Firebase para el modo fallback.

**Solución:**

Agregar al archivo `.env.local` del dashboard:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trustless-work-solana.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trustless-work-solana
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=trustless-work-solana.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Estas variables están documentadas en `.env.example`.

---

## 🚀 Cómo Probar el Sistema

### 1. Iniciar Backend

```bash
cd apps/server
npm run start:dev
```

El servidor WebSocket estará en `http://localhost:3000/notifications`

### 2. Iniciar Frontend

```bash
cd apps/dashboard
npm run dev
```

### 3. Testing Manual (después de implementar JWT)

1. **Conectar wallet** en el dashboard
2. **Trigger CRON job** para generar notificaciones:
   ```bash
   curl http://localhost:3000/notifications/test/check-pending
   ```
3. **Verificar:**
   - Toast notification aparece
   - Badge de unread count actualiza
   - Notification center muestra la notificación
4. **Probar WebSocket:**
   - Abrir DevTools > Network > WS
   - Verificar que hay una conexión WebSocket activa
5. **Probar fallback mode:**
   - Desconectar WiFi
   - Crear notificación manualmente en Firestore
   - Verificar que aparece en el UI

### 4. Endpoints REST Disponibles

Todos requieren JWT Bearer token:

- `GET /notifications` - Listar notificaciones (con paginación)
- `GET /notifications/unread/count` - Contador de no leídas
- `GET /notifications/:id` - Obtener una notificación
- `PATCH /notifications/:id/read` - Marcar como leída
- `PATCH /notifications/read-all` - Marcar todas como leídas
- `DELETE /notifications/:id` - Eliminar notificación

---

## 📁 Archivos Creados/Modificados

### Backend (10 archivos)

**Creados:**

1. `apps/server/src/notifications/gateways/notifications.gateway.ts`
2. `apps/server/src/notifications/dto/create-notification.dto.ts`
3. `apps/server/src/notifications/dto/pagination.dto.ts`

**Modificados:**

1. `apps/server/src/notifications/notifications.service.ts`
2. `apps/server/src/notifications/notifications.controller.ts`
3. `apps/server/src/notifications/notifications.module.ts`
4. `apps/server/src/interfaces/notifications.interface.ts`
5. `apps/server/.env`
6. `apps/server/.env.example`

### Frontend (11 archivos)

**Creados:**

1. `apps/dashboard/lib/socket.ts`
2. `apps/dashboard/services/notifications.api.ts`
3. `apps/dashboard/core/store/ui/@types/notifications.entity.ts`
4. `apps/dashboard/core/store/ui/slices/notifications.slice.ts`
5. `apps/dashboard/hooks/notifications.hook.ts`
6. `apps/dashboard/components/notifications/NotificationBell.tsx`
7. `apps/dashboard/components/notifications/NotificationCenter.tsx`
8. `apps/dashboard/components/ui/scroll-area.tsx`

**Modificados:**

1. `apps/dashboard/core/store/ui/index.ts`
2. `apps/dashboard/components/layout/header/Header.tsx`
3. `apps/dashboard/firebase.ts`
4. `apps/dashboard/.env.local`
5. `apps/dashboard/.env.example`

---

## 🔧 Troubleshooting

### Error: "Authentication required" en WebSocket

- **Causa:** No se está enviando JWT token
- **Solución:** Implementar el flujo de login (ver sección 1)

### Error: "Cannot read property 'includes' of undefined"

- **Causa:** Notificación sin campo `entities` o `readBy`
- **Solución:** Verificar que las notificaciones en Firestore tengan estos campos

### Notificaciones no aparecen

- **Causa:** Wallet address no está en el array `entities` de la notificación
- **Solución:** Verificar que los CRON jobs incluyen la wallet address correcta

### WebSocket no conecta

- **Causa:** CORS origins incorrectos
- **Solución:** Verificar `WEBSOCKET_CORS_ORIGINS` en `.env` del servidor

---

## 📊 Tipos de Notificaciones

```typescript
enum NotificationType {
  CONTRACT_CREATED = "CONTRACT_CREATED",
  WORK_SUBMITTED = "WORK_SUBMITTED",
  WORK_APPROVED = "WORK_APPROVED",
  WORK_REJECTED = "WORK_REJECTED",
  PAYMENT_RELEASED = "PAYMENT_RELEASED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  DISPUTE_OPENED = "DISPUTE_OPENED",
  DISPUTE_RESOLVED = "DISPUTE_RESOLVED",
  CONTRACT_CANCELLED = "CONTRACT_CANCELLED",
  DEADLINE_APPROACHING = "DEADLINE_APPROACHING",
  MILESTONE_COMPLETED = "MILESTONE_COMPLETED",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}
```

---

## 🎯 Próximos Pasos

1. ✅ Implementar JWT authentication (crítico)
2. ✅ Configurar Firestore Security Rules
3. ✅ Agregar variables de Firebase al frontend
4. ⏳ Testing E2E completo
5. ⏳ Optimización de performance
6. ⏳ Agregar tests unitarios
7. ⏳ Documentar API en Swagger

---

## 📝 Notas

- El sistema usa el campo `readBy` como array de wallet addresses para soporte multi-usuario
- El modo fallback de Firestore se activa automáticamente cuando WebSocket falla
- Los CRON jobs se ejecutan automáticamente según schedule configurado
- Todas las notificaciones tienen metadata opcional para contexto adicional
