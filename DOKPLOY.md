# Guía de Despliegue en Dokploy

Esta guía te ayudará a desplegar el backend de Rakium en Dokploy.

## Prerrequisitos

1. Tener una cuenta en Dokploy configurada
2. Tener acceso a un servidor PostgreSQL (puede ser el mismo servidor de Dokploy o uno externo)
3. Tener el repositorio en GitHub/GitLab/Bitbucket

## Pasos para el Despliegue

### 1. Crear la Aplicación en Dokploy

1. Inicia sesión en tu panel de Dokploy
2. Haz clic en "Create" o "Nueva Aplicación"
3. Asigna un nombre (ej: "Backend" o "rakium-be")
4. Selecciona el servidor donde quieres desplegar (ej: "Dokploy Default")
5. Haz clic en "Create"

### 2. Configurar el Repositorio

1. En la configuración de la aplicación, ve a la sección "Source"
2. Conecta tu repositorio de Git (GitHub/GitLab/Bitbucket)
3. Selecciona la rama que quieres desplegar (generalmente `main` o `master`)
4. Configura el build:
   - **Build Type**: Dockerfile
   - **Dockerfile Path**: `Dockerfile` (o deja en blanco si está en la raíz)
   - **Docker Context**: `.` (raíz del proyecto)

### 3. Configurar Variables de Entorno

Ve a la sección "Environment Variables" y agrega las siguientes variables:

#### Variables Requeridas

```
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db?schema=public
JWT_SECRET=tu-clave-secreta-super-segura-aqui
JWT_EXPIRATION=7d
PORT=3000
```

#### Variables Opcionales (para uploads a Backblaze B2)

```
BACKBLAZE_ACCESS_KEY_ID=tu-access-key-id
BACKBLAZE_SECRET_ACCESS_KEY=tu-secret-access-key
BACKBLAZE_BUCKET_NAME=nombre-de-tu-bucket
```

### 4. Configurar la Base de Datos

Si no tienes una base de datos PostgreSQL configurada:

1. En Dokploy, puedes crear una base de datos PostgreSQL desde el panel
2. O usa una base de datos externa y configura la `DATABASE_URL` con las credenciales correctas
3. Las migraciones de Prisma se ejecutarán automáticamente al iniciar el contenedor

### 5. Configurar el Puerto

En la configuración de la aplicación:
- **Port**: `3000` (o el puerto que hayas configurado en `PORT`)
- **Health Check Path**: `/api` (para verificar que la aplicación está funcionando)

### 6. Desplegar

1. Guarda todos los cambios de configuración
2. Haz clic en "Deploy" o "Redeploy"
3. Dokploy construirá la imagen Docker y desplegará la aplicación
4. Puedes ver los logs en tiempo real para verificar que todo funciona correctamente

## Verificación Post-Despliegue

Una vez desplegado, verifica que:

1. La aplicación está corriendo (status "Running")
2. Los logs no muestran errores
3. Puedes acceder a la documentación Swagger en: `https://tu-dominio.com/api`
4. El health check responde correctamente

## Comandos Útiles

### Ver logs
En el panel de Dokploy, ve a la sección "Logs" de tu aplicación

### Reiniciar la aplicación
Haz clic en "Restart" en el panel de Dokploy

### Ejecutar migraciones manualmente
Si necesitas ejecutar migraciones manualmente, puedes conectarte al contenedor y ejecutar:
```bash
npx prisma migrate deploy
```

## Troubleshooting

### Error: "Cannot connect to database"
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté accesible desde el servidor de Dokploy
- Verifica que el firewall permita conexiones al puerto de PostgreSQL

### Error: "Prisma Client not generated"
- El Dockerfile ya incluye la generación del cliente Prisma
- Si persiste, verifica los logs del build

### Error: "Port already in use"
- Verifica que no haya otra aplicación usando el puerto 3000
- Cambia el puerto en la variable de entorno `PORT`

## Notas Importantes

- El Dockerfile ejecuta automáticamente las migraciones de Prisma al iniciar el contenedor
- El seed de la base de datos NO se ejecuta automáticamente en producción (por seguridad)
- Si necesitas ejecutar el seed, hazlo manualmente después del primer despliegue
- Las variables de entorno sensibles (como `JWT_SECRET`) deben ser seguras y únicas
