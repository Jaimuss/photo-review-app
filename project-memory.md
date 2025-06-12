# 📸 Memoria Técnica - Photo Review App

## ⚠️ ARCHIVO PRINCIPAL DE REFERENCIA
**SIEMPRE SEGUIR:** `Instrucciones reglas y tasklist.md` - Este archivo contiene las reglas definitivas del proyecto, task list optimizada y restricciones. DEBE ser consultado y seguido en todo momento.

## 🎯 PROPÓSITO Y REGLAS DEL PROYECTO

### 📸 Propósito de Photo Review App

**🎯 Objetivo Principal**
Photo Review App es una plataforma especializada que resuelve un problema crítico en el flujo de trabajo fotográfico profesional: la selección y revisión eficiente de fotografías entre fotógrafos y sus clientes.

**👥 ¿Para Quién Está Diseñada?**
La aplicación sirve como puente entre dos grupos principales:

**Fotógrafos profesionales** que necesitan:
- Compartir sesiones fotográficas con clientes
- Recibir feedback organizado
- Identificar rápidamente las fotos preferidas
- Optimizar su flujo de trabajo post-producción

**Clientes** que quieren:
- Revisar cómodamente sus sesiones fotográficas
- Seleccionar sus fotos favoritas
- Proporcionar comentarios específicos
- Participar en el proceso de selección sin necesidad de conocimientos técnicos

**🔍 Problemas que Resuelve**

*Para Fotógrafos:*
- Elimina el caos de feedback por email, WhatsApp o mensajes de texto
- Reduce el tiempo de selección que tradicionalmente toma días o semanas
- Evita confusiones sobre qué fotos editar o imprimir
- Centraliza la comunicación con el cliente en un solo lugar
- Profesionaliza la presentación de su trabajo

*Para Clientes:*
- Simplifica la revisión de grandes cantidades de fotos
- Elimina la frustración de describir qué fotos les gustan
- Proporciona herramientas intuitivas para expresar preferencias
- Permite acceso desde cualquier dispositivo sin instalar software

### 🗺️ DUMMY MAP - Archivos que Cursor PUEDE modificar

**✅ ARCHIVOS PERMITIDOS PARA MODIFICAR**
```
photo-review-app/
├── 📁 app/
│   ├── 📁 api/
│   │   ├── 📁 sessions/
│   │   │   ├── 📄 demo/route.ts                    ✅ PUEDE MODIFICAR
│   │   │   ├── 📄 access/route.ts                  ✅ PUEDE MODIFICAR
│   │   │   ├── 📄 export/route.ts                  ✅ PUEDE MODIFICAR
│   │   │   └── 📁 [id]/
│   │   │       ├── 📄 route.ts                     ✅ PUEDE MODIFICAR
│   │   │       └── 📄 events/route.ts              ✅ PUEDE MODIFICAR
│   │   ├── 📁 photos/
│   │   │   ├── 📄 rating/route.ts                  ✅ PUEDE MODIFICAR
│   │   │   ├── 📄 color-tag/route.ts               ✅ PUEDE MODIFICAR
│   │   │   ├── 📄 comment/route.ts                 ✅ PUEDE MODIFICAR
│   │   │   └── 📄 favorite/route.ts                ✅ PUEDE MODIFICAR
│   │   └── 📁 photographer/
│   │       └── 📁 sessions/
│   │           └── 📄 route.ts                     ✅ PUEDE MODIFICAR
├── 📁 lib/
│   ├── 📄 database.ts                              ✅ PUEDE MODIFICAR - Para SQLite
│   ├── 📄 file-storage.ts                          ✅ PUEDE MODIFICAR - Sistema archivos
│   ├── 📄 report-generator.ts                      ✅ PUEDE MODIFICAR - Generador reportes
├── 📁 database/
│   └── 📄 schema.sql                               ✅ PUEDE MODIFICAR - Esquema DB
├── 📄 package.json                                 ✅ PUEDE MODIFICAR - Dependencias
├── 📄 next.config.mjs                              ✅ PUEDE MODIFICAR - Config Next.js
```

**🆕 ARCHIVOS NUEVOS QUE CURSOR PUEDE CREAR**
```
├── 📄 .env.local                                   ✅ CREAR - Variables entorno
├── 📄 middleware.ts                                ✅ CREAR - Auth middleware
├── 📁 lib/
│   ├── 📄 auth.ts                                  ✅ CREAR - Sistema autenticación
│   ├── 📄 token-generator.ts                       ✅ CREAR - Generador tokens
│   ├── 📄 image-processor.ts                       ✅ CREAR - Procesamiento imágenes
│   ├── 📄 analytics.ts                             ✅ CREAR - Sistema analytics
│   └── 📁 db/
│       ├── 📄 index.ts                             ✅ CREAR - Conexión SQLite
│       ├── 📄 schema.ts                            ✅ CREAR - Esquema Drizzle
│       └── 📁 migrations/                          ✅ CREAR - Migraciones DB
├── 📁 components/
│   ├── 📄 upload-zone.tsx                          ✅ CREAR - Zona subida
│   ├── 📄 photo-comparison.tsx                     ✅ CREAR - Comparación fotos
│   ├── 📄 slideshow.tsx                            ✅ CREAR - Slideshow
│   ├── 📄 photo-comments.tsx                       ✅ CREAR - Comentarios
│   └── 📁 charts/                                  ✅ CREAR - Gráficos analytics
```

**🚫 ARCHIVOS PROHIBIDOS - NO TOCAR**
```
❌ PROHIBIDO MODIFICAR:
├── 📁 components/ui/                               # Componentes shadcn funcionando
├── 📄 app/layout.tsx                              # Layout base funcional
├── 📄 app/globals.css                             # Estilos shadcn configurados
├── 📄 tailwind.config.ts                          # Config Tailwind optimizada
├── 📄 components/mode-toggle.tsx                  # Toggle tema funcional
├── 📄 components/theme-provider.tsx               # Provider tema funcional
├── 📄 app/page.tsx                                # Landing page completa
├── 📄 app/dashboard/page.tsx                      # Dashboard principal completo
├── 📄 app/session/[id]/page.tsx                   # Componente principal completo
├── 📄 app/dashboard/sessions/new/page.tsx         # Formulario funcional
├── 📄 lib/utils.ts                                # Utilidades shadcn
└── 📄 tsconfig.json                               # Config TypeScript optimizada
```

**📝 REGLAS PARA CURSOR**

**✅ LO QUE SÍ PUEDES HACER:**
- Crear archivos nuevos en las ubicaciones permitidas
- Modificar APIs existentes para mejorar funcionalidad
- Actualizar package.json para añadir dependencias
- Modificar next.config.mjs para configuración
- Crear nuevos componentes que no interfieran con los existentes
- Modificar lib/database.ts para migrar a SQLite
- Crear sistema de autenticación completo
- Implementar nuevas funcionalidades sin romper las existentes

**❌ LO QUE NO PUEDES HACER:**
- Modificar componentes UI de shadcn - Están perfectamente configurados
- Cambiar el layout principal - El diseño está optimizado
- Tocar los estilos globales - Tailwind está configurado correctamente
- Modificar páginas principales - Funcionan perfectamente
- Cambiar la estructura de carpetas de componentes existentes
- Alterar configuraciones de TypeScript o Tailwind

### 📋 TASK LIST OPTIMIZADA - Photo Review App

**🎯 OBJETIVO FINAL**
Aplicación de revisión de fotos 100% funcional con backend local y links compartibles externamente.

**📦 FASE 1: CONFIGURACIÓN BÁSICA**

**TASK 1.1: Configurar acceso externo**
- Objetivo: Permitir acceso desde otros dispositivos en la red local
- Archivos: package.json (script dev:host), next.config.mjs (headers CORS), .env.local
- Prueba: Acceder desde otro dispositivo con código demo-token-123

**TASK 1.2: Migrar a SQLite**
- Objetivo: Base de datos persistente local
- Dependencias: better-sqlite3, drizzle-orm, drizzle-kit
- Archivos: lib/db/schema.ts, lib/db/index.ts, actualizar lib/database.ts
- Prueba: Verificar que datos persisten tras reinicio

**📸 FASE 2: SUBIDA DE ARCHIVOS**

**TASK 2.1: Sistema de subida**
- Objetivo: Subir múltiples fotos a una sesión
- Dependencias: multer, sharp, react-dropzone
- Archivos: app/api/sessions/[id]/upload/route.ts, components/upload-zone.tsx
- Prueba: Subir 3-5 imágenes y verificar thumbnails

**🔐 FASE 3: AUTENTICACIÓN**

**TASK 3.1: Sistema de login básico**
- Objetivo: Login simple para fotógrafos
- Dependencias: bcryptjs, jsonwebtoken
- Archivos: lib/auth.ts, app/api/auth/login/route.ts, middleware.ts
- Prueba: Login con demo@example.com/password

**🎨 FASE 4: FUNCIONALIDADES AVANZADAS**

**TASK 4.1: Comparación lado a lado**
- Objetivo: Comparar 2-4 fotos simultáneamente
- Archivos: components/photo-comparison.tsx
- Prueba: Seleccionar 2-3 fotos y compararlas

**TASK 4.2: Slideshow automático**
- Objetivo: Presentación automática de fotos
- Archivos: components/slideshow.tsx
- Prueba: Slideshow con controles de velocidad

**📊 FASE 5: REPORTES AVANZADOS**

**TASK 5.1: Generación de PDF profesional**
- Objetivo: Reportes en PDF con diseño profesional
- Dependencias: jspdf, html2canvas
- Archivos: lib/pdf-generator.ts, actualizar export API
- Prueba: Descargar PDF con estadísticas completas

**🔄 FASE 6: TIEMPO REAL**

**TASK 6.1: WebSockets para notificaciones**
- Objetivo: Notificaciones instantáneas bidireccionales
- Dependencias: socket.io, socket.io-client
- Archivos: lib/socket-server.ts, lib/socket-client.ts, server.js
- Prueba: Actualización simultánea en dos dispositivos

**📱 FASE 7: PWA Y OPTIMIZACIÓN**

**TASK 7.1: Progressive Web App**
- Objetivo: Convertir en PWA instalable
- Archivos: public/manifest.json, public/sw.js, components/pwa-install.tsx
- Prueba: Instalar como app y verificar modo offline

**🚀 FASE 8: TESTING Y DOCUMENTACIÓN**

**TASK 8.1: Testing básico**
- Objetivo: Tests esenciales para estabilidad
- Dependencias: jest, @testing-library/react
- Archivos: jest.config.js, __tests__/
- Prueba: Coverage > 70%

**TASK 8.2: Documentación completa**
- Objetivo: README y documentación de instalación
- Archivos: README.md, docs/api.md, docs/deployment.md
- Prueba: Seguir guía de instalación desde cero

**🎯 CHECKLIST FINAL COMPLETO**

**✅ Funcionalidades Core Implementadas:**
- [x] Sistema de calificación con estrellas
- [x] Etiquetas de color (verde/amarillo/rojo)  
- [x] Sistema de favoritos
- [x] Comentarios para retocador
- [x] Navegación con teclado/mouse/scroll
- [x] Zoom avanzado con doble clic
- [x] Filtros por rating y color
- [x] Modo grid y carrusel
- [x] Tema oscuro por defecto

---

## 🎯 Resumen Ejecutivo

**Photo Review App** es una plataforma web profesional que revoluciona el proceso de selección de fotografías entre fotógrafos y sus clientes. Construida con tecnologías modernas, ofrece colaboración en tiempo real, interfaz intuitiva y reportes profesionales.

### Métricas del Proyecto:
- **Líneas de código**: ~8,000
- **Componentes**: 25+ React components
- **APIs**: 15 endpoints RESTful
- **Base de datos**: 4 tablas principales
- **Tecnologías**: 12 dependencias core

## 🏗️ Arquitectura Técnica

### Stack Tecnológico:
```
Frontend:         Next.js 14 + TypeScript + Tailwind CSS
UI Components:    shadcn/ui + Radix UI
Backend:          Next.js API Routes + Node.js
Base de Datos:    SQLite + Drizzle ORM
Tiempo Real:      Socket.IO WebSockets
Autenticación:    JWT + bcrypt
Archivos:         File System + Sharp (processing)
PWA:              Service Workers + Manifest
Testing:          Jest + Testing Library
```

### Flujo de Datos:
```
Cliente → Next.js Frontend → API Routes → SQLite → WebSocket → Otros Clientes
                ↓
            File System (uploads/) ← Sharp (thumbnails)
```

## 📊 Estructura de Base de Datos

```sql
-- Fotógrafos registrados
photographers {
  id: string (PK)
  name: string
  email: string (unique)
  password_hash: string
  studio_name: string?
  created_at: timestamp
}

-- Sesiones fotográficas
sessions {
  id: string (PK)
  photographer_id: string (FK)
  client_name: string
  location: string
  session_date: string
  access_token: string (unique) -- para clientes
  status: 'active' | 'completed'
  created_at: timestamp
}

-- Fotos subidas
photos {
  id: string (PK)
  session_id: string (FK)
  filename: string
  original_url: string
  thumbnail_url: string
  upload_order: integer
  created_at: timestamp
}

-- Reviews de clientes
photo_reviews {
  id: string (PK)
  photo_id: string (FK)
  rating: integer (1-5, default: 3)
  color_tag: 'green' | 'yellow' | 'red' | null
  comment: text
  is_favorite: boolean
  is_reviewed: boolean
  updated_at: timestamp
}
```

## 🔐 Sistema de Autenticación

### Fotógrafos (Protegido):
```typescript
// JWT en cookies httpOnly
{
  userId: string,
  exp: timestamp,
  iat: timestamp
}
```

### Clientes (Sin registro):
```typescript
// Token único por sesión
access_token: "demo-token-123"
// Permite acceso directo a /session/[id]?code=token
```

## 🎨 Componentes Principales

### 1. PhotoGrid (Grid de fotos)
```typescript
interface Photo {
  id: string
  url: string
  rating: number (1-5)
  colorTag: 'green' | 'yellow' | 'red' | null
  isFavorite: boolean
  comments: string
  isReviewed: boolean
}

// Funcionalidades:
- Grid responsivo (2-6 columnas)
- Lazy loading con Intersection Observer
- Filtros por rating, color, favoritos
- Selección múltiple para comparación
```

### 2. PhotoCarousel (Navegación individual)
```typescript
// Controles:
- Teclado: ↑↓←→, Space, Esc, +/-
- Mouse: Click, doble clic, rueda
- Touch: Swipe, pinch-to-zoom

// Features:
- Zoom hasta 300% con pan
- Metadata overlay
- Navegación rápida con thumbnails
```

### 3. PhotoComparison (Lado a lado)
```typescript
// Permite comparar 2-4 fotos simultáneamente
- Zoom sincronizado opcional
- Calificación independiente
- Vista optimizada para decisiones
```

### 4. Slideshow (Presentación)
```typescript
// Presentación automática
- Velocidad configurable (1-5 segundos)
- Transiciones: fade, slide
- Control total con teclado
- Overlay con información de foto
```

## 🔄 Sistema de Tiempo Real

### WebSocket Events:
```typescript
// Cliente → Servidor
'join-session': sessionId
'leave-session': sessionId

// Servidor → Clientes
'photo-updated': {
  photoId: string
  updateType: 'rating' | 'color-tag' | 'favorite' | 'comment'
  data: any
  timestamp: string
}

'user-joined': {
  user: { type: 'photographer' | 'client' }
  timestamp: string
}
```

### Implementación:
- Socket.IO con rooms por sesión
- Notificaciones toast instantáneas
- Sincronización automática de estado
- Manejo de desconexiones

## 📁 Sistema de Archivos

### Estructura de uploads:
```
public/uploads/
├── session-001/
│   ├── IMG_0001.jpg          # Original
│   ├── IMG_0002.jpg
│   └── thumbnails/
│       ├── IMG_0001.jpg      # 300x400 optimizado
│       └── IMG_0002.jpg
└── session-002/
    └── ...
```

### Processing con Sharp:
```typescript
// Thumbnail generation
await sharp(buffer)
  .resize(300, 400, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toFile(thumbnailPath)
```

## 📈 APIs REST

### Autenticación:
```
POST /api/auth/login       # Login fotógrafo
POST /api/auth/logout      # Logout
```

### Sesiones:
```
GET    /api/sessions/[id]           # Datos de sesión
GET    /api/sessions/access         # Verificar token cliente
POST   /api/sessions/[id]/upload    # Subir fotos múltiples
POST   /api/sessions/export         # Generar PDF
```

### Fotos:
```
POST /api/photos/rating      # Actualizar rating
POST /api/photos/color-tag   # Actualizar etiqueta
POST /api/photos/comment     # Actualizar comentario
POST /api/photos/favorite    # Toggle favorito
```

## 🎯 Flujos de Usuario

### Fotógrafo:
```
1. Login (demo@example.com/password)
2. Dashboard → Nueva Sesión
3. Subir fotos en /dashboard/sessions/[id]/upload
4. Compartir enlace: /session/[id]?code=token
5. Monitorear progreso en tiempo real
6. Exportar reporte PDF final
```

### Cliente:
```
1. Acceso con token único (sin registro)
2. Ver fotos en grid o carrusel
3. Calificar: estrellas + colores + favoritos
4. Añadir comentarios para retocador
5. Comparar fotos lado a lado
6. Ver slideshow de seleccionadas
```

## 🚀 Optimizaciones

### Performance:
- **Lazy Loading**: Imágenes se cargan según viewport
- **Debouncing**: Actualizaciones agrupadas (500ms)
- **Memoización**: React.memo en componentes pesados
- **Image Optimization**: Next/Image con WebP automático

### UX:
- **Loading States**: Skeletons y progress bars
- **Error Boundaries**: Recuperación grácil de errores
- **Offline Support**: PWA con cache básico
- **Responsive**: Mobile-first design

### SEO:
- **Metadata**: Open Graph para compartir
- **Structured Data**: JSON-LD para sesiones
- **Sitemap**: Generación automática
- **Performance**: Core Web Vitals optimizados

## 📱 Progressive Web App

### Manifest:
```json
{
  "name": "Photo Review App",
  "short_name": "PhotoReview", 
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#000000",
  "background_color": "#000000"
}
```

### Service Worker:
- Cache de recursos estáticos
- Estrategia Cache-First para assets
- Network-First para APIs
- Offline page personalizada

## 🧪 Testing Strategy

### Cobertura:
```
Unit Tests:        Componentes individuales
Integration Tests: Flujos de API
E2E Tests:         Escenarios completos de usuario
Visual Tests:      Regresiones de UI
```

### Herramientas:
- **Jest**: Test runner principal
- **Testing Library**: Testing de componentes React
- **MSW**: Mock de APIs para testing
- **Playwright**: E2E testing (futuro)

## 📊 Métricas y Analytics

### Performance Tracking:
- Tiempo de carga inicial
- Tiempo de respuesta de APIs
- Tasa de conversión de reviews
- Uso de funcionalidades avanzadas

### Business Metrics:
- Sesiones creadas por día
- Fotos revisadas por sesión
- Tiempo promedio de selección
- Satisfacción del cliente (rating promedio)

## 🔮 Roadmap Futuro

### Fase 2 (Q2 2024):
- [ ] Integración con almacenamiento cloud (AWS S3)
- [ ] Sistema de pagos para fotógrafos
- [ ] Edición básica de fotos (crop, rotate)
- [ ] Múltiples clientes por sesión
- [ ] API para integraciones externas

### Fase 3 (Q3 2024):
- [ ] App móvil nativa (React Native)
- [ ] IA para pre-selección de fotos
- [ ] Watermarks automáticos
- [ ] Galería pública opcional
- [ ] Sistema de templates personalizables

## 💡 Lecciones Aprendidas

### Aciertos:
✅ **SQLite para MVP**: Simplicidad sin sacrificar funcionalidad
✅ **shadcn/ui**: Componentes consistentes y accesibles  
✅ **Socket.IO**: Colaboración fluida en tiempo real
✅ **Next.js 14**: App Router + Server Components

### Desafíos:
🔄 **File Management**: Manejo de archivos grandes
🔄 **State Sync**: Sincronización compleja entre usuarios
🔄 **Mobile UX**: Gestos táctiles avanzados
🔄 **Error Handling**: Recuperación de fallos de red

## 📞 Información de Contacto

**Desarrollo**: Tu equipo de desarrollo
**Demo**: http://localhost:3000 (código: demo-token-123)
**Repositorio**: GitHub (privado)
**Documentación**: /docs/ folder

---

*Última actualización: Junio 2025*