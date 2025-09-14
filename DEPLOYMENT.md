# Guía de Despliegue - Plataforma Elim Online

## Funcionalidades Implementadas

### ✅ Backend (Node.js + Express + MongoDB)
- **Autenticación de usuarios** con JWT
- **Registro de usuarios** con validación
- **Login de usuarios** con verificación de credenciales
- **Actualización de perfil** (nombre, email, teléfono)
- **Cambio de contraseña** con verificación de contraseña actual
- **Recuperación de contraseña** con token de seguridad
- **Envío de correos** (configurado para desarrollo y producción)

### ✅ Frontend (HTML + CSS + JavaScript)
- **Dashboard** con datos reales del usuario logueado
- **Gestión de contraseñas** (cambio y recuperación)
- **Edición de perfil** con validaciones
- **Configuración de usuario** (notificaciones, tema, idioma)
- **Lecciones interactivas** con progreso del usuario
- **Navegación fluida** entre secciones

## Variables de Entorno Requeridas

### Backend (.env)
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/elim-online
# o para MongoDB Atlas: mongodb+srv://usuario:password@cluster.mongodb.net/elim-online

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Email (opcional para desarrollo)
SENDGRID_API_KEY=tu_api_key_de_sendgrid
FRONTEND_URL=https://tu-dominio.vercel.app

# Entorno
NODE_ENV=production
```

### Frontend (Vercel)
En la configuración de Vercel, asegúrate de que la variable `API_BASE` esté configurada correctamente en los archivos JavaScript.

## Instrucciones de Despliegue

### 1. Backend (Render.com o similar)

1. **Conectar repositorio** a tu servicio de hosting
2. **Configurar variables de entorno** (ver arriba)
3. **Instalar dependencias**: `npm install`
4. **Comando de inicio**: `npm start` o `node server.js`
5. **Puerto**: Asegúrate de que el puerto esté configurado correctamente

### 2. Frontend (Vercel)

1. **Conectar repositorio** a Vercel
2. **Configurar build settings**:
   - Build Command: `npm run build` (si usas build) o dejar vacío
   - Output Directory: `Frontend/public` o `/`
3. **Variables de entorno** (si las necesitas):
   - `NODE_ENV=production`
4. **Deploy**

### 3. Base de Datos (MongoDB Atlas)

1. **Crear cluster** en MongoDB Atlas
2. **Configurar acceso** (IP whitelist, usuario de base de datos)
3. **Obtener connection string** y configurarlo en `MONGODB_URI`

## Endpoints de la API

### Autenticación
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Login de usuario
- `GET /api/me` - Obtener datos del usuario logueado

### Usuarios
- `POST /api/users` - Crear usuario (registro)
- `GET /api/users` - Listar usuarios
- `PUT /api/users/profile` - Actualizar perfil (requiere auth)
- `PUT /api/users/change-password` - Cambiar contraseña (requiere auth)
- `POST /api/users/request-password-reset` - Solicitar recuperación
- `POST /api/users/reset-password` - Resetear contraseña con token

### Cursos
- `GET /api/courses` - Listar cursos disponibles

## Configuración de Email

### Desarrollo
- Los tokens de recuperación se muestran en la consola del servidor
- No se envían emails reales

### Producción
- Configurar `SENDGRID_API_KEY` para envío real de emails
- O cambiar a otro proveedor en `Backend/src/config/email.js`

## Estructura de Archivos

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.js          # Configuración de base de datos
│   │   └── email.js       # Configuración de email
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── courseController.js
│   ├── middleware/
│   │   └── auth.js        # Middleware de autenticación
│   ├── models/
│   │   ├── User.js        # Modelo de usuario
│   │   └── Courses.js     # Modelo de cursos
│   └── routes/
│       ├── authRoutes.js
│       ├── userRoutes.js
│       └── coursesRoutes.js
├── package.json
└── server.js

Frontend/
└── public/
    ├── pages/
    │   ├── dashboard/
    │   ├── login/
    │   ├── register/
    │   ├── password/
    │   ├── perfil-configuracion/
    │   └── lecciones/
    └── style.css
```

## Testing

### Backend
```bash
cd Backend
npm test  # Si tienes tests configurados
```

### Frontend
- Probar todas las funcionalidades en el navegador
- Verificar que los datos del usuario se cargan correctamente
- Probar cambio de contraseña y recuperación

## Notas Importantes

1. **Seguridad**: Cambia el `JWT_SECRET` por uno seguro en producción
2. **CORS**: Asegúrate de configurar CORS correctamente para tu dominio
3. **HTTPS**: Usa HTTPS en producción para seguridad
4. **Base de datos**: Configura backups automáticos en MongoDB Atlas
5. **Logs**: Configura logging para monitoreo en producción

## Solución de Problemas

### Error de CORS
- Verificar que el frontend esté en el mismo dominio o configurar CORS en el backend

### Error de autenticación
- Verificar que el token JWT esté configurado correctamente
- Revisar que las rutas protegidas tengan el middleware de auth

### Error de base de datos
- Verificar la cadena de conexión de MongoDB
- Asegurarse de que la base de datos esté accesible desde el servidor

### Error de email
- En desarrollo, los emails no se envían, solo se loguean
- En producción, verificar la configuración del proveedor de email
