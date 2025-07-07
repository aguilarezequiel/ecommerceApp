# 🛍️ E-commerce Fullstack - ShopApp

Una aplicación de e-commerce completa construida con **Next.js 14**, **Express.js**, **Prisma** y **MySQL**.

## ✨ Características

### 🛒 **Para Clientes**
- Autenticación completa (registro/login)
- Catálogo de productos con categorías y búsqueda
- Carrito de compras con persistencia
- Sistema de checkout seguro
- Seguimiento de pedidos en tiempo real
- Historial de compras
- Emails de confirmación automáticos

### 👨‍💼 **Para Administradores**
- Panel de administración completo
- Gestión de productos (CRUD con imágenes)
- Gestión de pedidos y estados
- Dashboard con estadísticas
- Sistema de notificaciones por stock bajo

### 🔧 **Características Técnicas**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Base de datos**: MySQL con Prisma ORM
- **Autenticación**: JWT con middleware de seguridad
- **Upload**: Multer para manejo de imágenes
- **Emails**: Nodemailer con templates HTML
- **Estado global**: Zustand con persistencia
- **Validación**: Zod para validación de datos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd ecommerce-fullstack
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

**Configurar variables de entorno:**
Crear archivo `.env` en la carpeta `backend/`:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/ecommerce"
JWT_SECRET="tu-clave-secreta-muy-segura"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
FROM_EMAIL="tu-email@gmail.com"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
PORT=3001
```

**Configurar base de datos:**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear y aplicar migraciones
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate
```

**Iniciar servidor backend:**
```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

**Configurar variables de entorno:**
Crear archivo `.env.local` en la carpeta `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Iniciar servidor frontend:**
```bash
npm run dev
```

### 4. Crear datos de prueba

**Crear usuario administrador** (via API o directamente en la base de datos):
```sql
INSERT INTO users (id, email, password, firstName, lastName, role) 
VALUES (
  'admin-id', 
  'admin@demo.com', 
  '$2a$10$hashedPassword', -- usar bcrypt para hashear 'password123'
  'Admin', 
  'User', 
  'ADMIN'
);
```

## 📁 Estructura del Proyecto

```
ecommerce-fullstack/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Controladores de la API
│   │   ├── middleware/           # Middleware de autenticación y upload
│   │   ├── routes/              # Rutas de la API
│   │   ├── services/            # Servicios (email, etc.)
│   │   └── app.ts               # Aplicación principal
│   ├── prisma/
│   │   └── schema.prisma        # Esquema de base de datos
│   ├── uploads/                 # Imágenes subidas
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                 # Páginas (App Router)
    │   ├── components/          # Componentes reutilizables
    │   └── lib/                 # Utilidades y configuración
    └── package.json
```

## 🔐 Credenciales de Prueba

Una vez configurado, puedes usar estas credenciales:

**Administrador:**
- Email: `admin@demo.com`
- Contraseña: `password123`

**Cliente:**
- Email: `user@demo.com`
- Contraseña: `password123`

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto

### Carrito (requiere autenticación)
- `GET /api/cart` - Obtener carrito
- `POST /api/cart` - Agregar al carrito
- `PUT /api/cart/:id` - Actualizar cantidad
- `DELETE /api/cart/:id` - Eliminar del carrito

### Pedidos (requiere autenticación)
- `POST /api/orders` - Crear pedido
- `GET /api/orders` - Listar pedidos del usuario
- `GET /api/orders/:id` - Obtener pedido específico
- `GET /api/orders/track/:trackingCode` - Seguimiento público

### Admin (requiere rol ADMIN)
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/products` - Listar todos los productos
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/:id` - Actualizar producto
- `DELETE /api/admin/products/:id` - Eliminar producto
- `GET /api/admin/orders` - Listar todos los pedidos
- `PUT /api/admin/orders/:id/status` - Actualizar estado

## 🎨 Diseño y UX

- **Responsive**: Funciona en móviles, tablets y desktop
- **Modo oscuro**: Interfaz moderna con Tailwind CSS
- **Animaciones**: Transiciones suaves y feedback visual
- **Accesibilidad**: Cumple estándares de accesibilidad web

## 📧 Sistema de Emails

El sistema envía automáticamente:
- **Confirmación de pedido** con detalles completos
- **Actualizaciones de estado** cuando cambia el estado del pedido
- **Código de seguimiento** para rastrear envíos

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Validación de datos con Zod
- Middleware de seguridad con Helmet
- CORS configurado
- Encriptación de contraseñas con bcrypt
- Upload de archivos con validación de tipo y tamaño

## 🚀 Deploy a Producción

### Backend (Railway/Heroku)
1. Configurar variables de entorno
2. Conectar base de datos MySQL (PlanetScale recomendado)
3. Ejecutar migraciones: `npm run db:migrate`

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variable `NEXT_PUBLIC_API_URL` con la URL del backend

## 🛠️ Desarrollo

### Scripts disponibles

**Backend:**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar TypeScript
npm run start        # Servidor de producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar cambios al esquema
npm run db:migrate   # Crear y aplicar migraciones
```

**Frontend:**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema:
- Abre un [Issue](link-to-issues)
- Envía un email a: soporte@shopapp.com

---

⭐ **¡Si te gusta este proyecto, dale una estrella!** ⭐