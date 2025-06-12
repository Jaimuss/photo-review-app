# 📸 Photo Review App

Plataforma profesional para revisión colaborativa de fotografías entre fotógrafos y sus clientes.

## 🎯 Estado Actual del Proyecto

### ✅ **COMPLETADO**
- **TASK 1.1** - Configuración para acceso externo ✅
- **TASK 1.2** - Migración a SQLite ✅

### 🚧 **EN PROGRESO**
- TASK 2.1 - Sistema de subida de archivos
- TASK 3.1 - Sistema de autenticación
- TASK 4.1 - Comparación lado a lado
- TASK 4.2 - Slideshow automático
- TASK 5.1 - Reportes PDF profesionales
- TASK 6.1 - WebSockets para tiempo real
- TASK 7.1 - Progressive Web App
- TASK 8.1 - Testing básico

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/photo-review-app.git
cd photo-review-app
```

2. **Instalar dependencias**
```bash
npm install --legacy-peer-deps
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=demo-secret-key-for-development
NODE_ENV=development
```

4. **Ejecutar en desarrollo**
```bash
# Acceso local
npm run dev

# Acceso desde red local (otros dispositivos)
npm run dev:host
```

5. **Acceder a la aplicación**
- Local: http://localhost:3000
- Red local: http://[TU_IP]:3000

## 📱 Uso de la Demo

### Para Clientes (Revisión de Fotos)
1. **Acceso directo**: http://localhost:3000/session/session-001?code=demo-token-123
2. **Funcionalidades disponibles**:
   - ✅ Grid de 48 fotos de demostración
   - ✅ Navegación en carrusel (flechas, doble clic)
   - ✅ Sistema de calificación con estrellas (1-5)
   - ✅ Etiquetas de color (verde=seleccionar, amarillo=revisar, rojo=descartar)
   - ✅ Sistema de favoritos (corazón)
   - ✅ Comentarios para el retocador
   - ✅ Filtros por rating y color
   - ✅ Zoom avanzado con doble clic
   - ✅ Navegación con teclado (←→↑↓, Espacio, Esc, +/-)

### Para Fotógrafos (Dashboard)
1. **Acceso**: http://localhost:3000/dashboard
2. **Funcionalidades**:
   - ✅ Vista general de sesiones
   - ✅ Crear nueva sesión
   - ✅ Monitorear progreso de revisión
   - ✅ Exportar reportes

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Componentes UI modernos

### Backend
- **Next.js API Routes** - Endpoints REST
- **SQLite + Drizzle ORM** - Base de datos persistente local
- **better-sqlite3** - Driver SQLite nativo

### Funcionalidades
- **Responsive Design** - Optimizado para móviles y desktop
- **Dark Mode** - Tema oscuro por defecto
- **External Access** - Acceso desde red local configurado
- **CORS Headers** - Headers configurados para desarrollo

## 📊 Estructura de la Base de Datos

```sql
-- Fotógrafos registrados
photographers (
  id, name, email, password_hash, studio_name, created_at
)

-- Sesiones fotográficas  
sessions (
  id, photographer_id, client_name, location, 
  session_date, access_token, status, created_at
)

-- Fotos subidas
photos (
  id, session_id, filename, original_url, 
  thumbnail_url, upload_order, created_at
)

-- Reviews de clientes
photo_reviews (
  id, photo_id, rating, color_tag, comment, 
  is_favorite, is_reviewed, updated_at
)
```

## 🗂️ Estructura del Proyecto

```
photo-review-app/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── dashboard/         # Panel de fotógrafos  
│   ├── session/           # Interfaz de clientes
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   └── ui/               # Componentes shadcn/ui
├── lib/                   # Utilidades y servicios
│   ├── db/               # Base de datos SQLite
│   │   ├── schema.ts     # Esquema Drizzle
│   │   └── index.ts      # Conexión DB
│   ├── database.ts       # Servicio de base de datos
│   └── utils.ts          # Utilidades generales
├── public/               # Archivos estáticos
│   └── uploads/          # Directorio para fotos subidas
└── hooks/                # Custom React hooks
```

## 🧪 Datos de Demo

La aplicación incluye datos de demostración:
- **Sesión**: "María González - Sesión Familiar"
- **Token de acceso**: `demo-token-123`  
- **48 fotos** con calificaciones y etiquetas variadas
- **12 fotos revisadas** para testing de filtros

## 🔧 APIs Disponibles

### Sesiones
- `GET /api/sessions/[id]` - Obtener datos de sesión
- `GET /api/sessions/access?code=` - Verificar token de acceso

### Reviews de Fotos  
- `POST /api/photos/rating` - Actualizar calificación
- `POST /api/photos/color-tag` - Actualizar etiqueta de color
- `POST /api/photos/comment` - Actualizar comentario
- `POST /api/photos/favorite` - Toggle favorito

### Reportes
- `POST /api/sessions/export` - Generar reporte (próximamente)

## 🌐 Acceso Externo

### Configuración de Red Local
1. **Obtener IP local**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Configurar firewall** (si es necesario):
   - Permitir puerto 3000
   - Verificar que no hay proxy/VPN bloqueando

3. **Acceder desde otros dispositivos**:
   - http://[TU_IP]:3000
   - http://[TU_IP]:3000/session/session-001?code=demo-token-123

## 📝 Próximas Funcionalidades

### Fase 2: Sistema de Archivos
- Subida múltiple de fotos con drag & drop
- Generación automática de thumbnails
- Procesamiento de imágenes con Sharp

### Fase 3: Autenticación
- Login para fotógrafos con JWT
- Protección de rutas del dashboard
- Tokens únicos por sesión

### Fase 4: Funcionalidades Avanzadas
- Comparación lado a lado (2-4 fotos)
- Slideshow automático con controles
- Herramientas de zoom avanzado

### Fase 5: Tiempo Real
- WebSockets con Socket.IO
- Notificaciones instantáneas
- Sincronización entre dispositivos

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

MIT License

---

**Desarrollado siguiendo las mejores prácticas de UX/UI para fotógrafos profesionales** 📸 