# Configuración para Despliegue en Vercel

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en tu proyecto de Vercel:

### 1. Base de Datos
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/elim-online
```

### 2. JWT Secret
```
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
```

### 3. Configuración de Email
```
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

### 4. URL del Frontend
```
FRONTEND_URL=https://tu-dominio.vercel.app
```

### 5. Puerto (opcional)
```
PORT=3000
```

## Configuración de Gmail para Envío de Emails

1. **Habilitar verificación en 2 pasos** en tu cuenta de Google
2. **Generar una contraseña de aplicación**:
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Mail"
3. **Usa esa contraseña** en la variable `EMAIL_PASS`

## Instalación de Dependencias

El backend ya incluye todas las dependencias necesarias en `package.json`:
- nodemailer (para envío de emails)
- bcryptjs (para hash de contraseñas)
- jsonwebtoken (para autenticación)
- mongoose (para base de datos)
- express (servidor)

## Funcionalidades Implementadas

### Backend
- ✅ Registro de usuarios
- ✅ Login de usuarios
- ✅ Recuperación de contraseña por email
- ✅ Restablecimiento de contraseña con token
- ✅ Cambio de contraseña (usuario autenticado)
- ✅ Obtener perfil de usuario
- ✅ Actualizar perfil de usuario

### Frontend
- ✅ Página de recuperación de contraseña
- ✅ Página de cambio de contraseña
- ✅ Página de edición de perfil
- ✅ Página de configuración de usuario
- ✅ Validación de formularios
- ✅ Indicador de fortaleza de contraseña
- ✅ Manejo de errores y mensajes de éxito

## Rutas de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Login de usuario
- `GET /me` - Obtener usuario autenticado
- `POST /forgot-password` - Solicitar recuperación
- `POST /reset-password` - Restablecer contraseña
- `POST /change-password` - Cambiar contraseña

### Usuarios (`/api/users`)
- `POST /` - Crear usuario
- `GET /` - Listar usuarios
- `GET /profile` - Obtener perfil (autenticado)
- `PUT /profile` - Actualizar perfil (autenticado)

## Notas Importantes

1. **Seguridad**: Cambia el JWT_SECRET por uno seguro y único
2. **Email**: Configura correctamente las credenciales de Gmail
3. **CORS**: El backend ya está configurado para aceptar peticiones del frontend
4. **Validación**: Todos los formularios incluyen validación tanto en frontend como backend
