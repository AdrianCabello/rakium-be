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

### 4. Crear y Configurar la Base de Datos PostgreSQL

Tienes **3 opciones** para crear la base de datos:

#### Opción 1: Crear Base de Datos en Dokploy (Recomendado)

1. En el panel de Dokploy, ve a la sección **"Databases"** o **"Services"**
2. Haz clic en **"Create Database"** o **"Add Service"**
3. Selecciona **PostgreSQL** como tipo de base de datos
4. Configura:
   - **Name**: `rakium-db` (o el nombre que prefieras)
   - **Database Name**: `rakium_production` (o el nombre que prefieras)
   - **Username**: `rakium_user` (o el que prefieras)
   - **Password**: Genera una contraseña segura (guárdala bien)
   - **Server**: Selecciona el mismo servidor donde está tu aplicación
5. Haz clic en **"Create"**
6. Dokploy te mostrará la **connection string** o los datos de conexión
7. Copia la `DATABASE_URL` que te proporciona (o constrúyela con el formato: `postgresql://usuario:password@host:puerto/nombre_db?schema=public`)

#### Opción 2: Crear Base de Datos como Aplicación Docker en Dokploy

Si Dokploy no tiene una opción directa de base de datos:

1. Crea una **nueva aplicación** en Dokploy
2. En la configuración, selecciona **"Docker Image"** o **"Pre-built Image"**
3. Usa la imagen: `postgres:15-alpine` (o la versión que prefieras)
4. Agrega las siguientes variables de entorno:
   ```
   POSTGRES_DB=rakium_production
   POSTGRES_USER=rakium_user
   POSTGRES_PASSWORD=tu-password-segura
   ```
5. Expone el puerto `5432` internamente
6. Una vez creada, obtén la IP/hostname interno del contenedor
7. Construye la `DATABASE_URL`: `postgresql://rakium_user:tu-password-segura@host-interno:5432/rakium_production?schema=public`

#### Opción 3: Usar Base de Datos Externa

Si ya tienes una base de datos PostgreSQL externa (como en Hostinger o tu servidor local):

1. Asegúrate de que la base de datos sea accesible desde el servidor de Dokploy
2. Configura el firewall para permitir conexiones desde la IP del servidor de Dokploy
3. Construye la `DATABASE_URL` con el formato:
   ```
   postgresql://usuario:password@host:puerto/nombre_db?schema=public
   ```
   Ejemplo:
   ```
   postgresql://postgres:nkh123@147.93.13.17:5432/eventloop_local?schema=public
   ```

#### Migrar Datos desde Railway (Opcional)

Si quieres migrar los datos existentes de Railway a Dokploy:

1. **Hacer dump de la base de datos de Railway:**
   ```bash
   ./scripts/dump-railway-db.sh
   ```
   Este script creará un archivo SQL en `./dumps/` con todos los datos de Railway.

2. **Importar el dump en Dokploy:**

   **Opción A: Desde tu máquina local (si la base de datos es accesible externamente)**
   ```bash
   ./scripts/import-dump-to-dokploy.sh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql 'postgresql://usuario:password@host-externo:puerto/nombre_db'
   ```

   **Opción B: Desde el servidor de Dokploy (recomendado si la base de datos solo es accesible internamente)**
   
   a. Sube el archivo de dump al servidor de Dokploy (usando SCP, SFTP, o el panel de Dokploy)
   
   b. Conéctate al servidor de Dokploy vía SSH
   
   c. Ejecuta:
   ```bash
   # Si tienes psql instalado en el servidor
   psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < railway-dump-YYYYMMDD-HHMMSS.sql
   
   # O usando Docker (si no tienes psql instalado)
   docker run --rm -i -v $(pwd):/dumps postgres:16-alpine psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < railway-dump-YYYYMMDD-HHMMSS.sql
   ```

   **Opción C: Usar un contenedor temporal en Dokploy**
   
   Crea un contenedor temporal con PostgreSQL client y ejecuta la importación:
   ```bash
   # En Dokploy, crea un contenedor temporal
   docker run --rm -it --network dokploy_default \
     -v /ruta/al/dump:/dumps \
     postgres:16-alpine \
     psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < /dumps/railway-dump-YYYYMMDD-HHMMSS.sql
   ```

   **Nota**: 
   - Esto sobrescribirá los datos existentes en la base de datos de Dokploy
   - Si `rakium-database-nnbukr` es un nombre de servicio interno de Docker, solo será accesible desde dentro de la red de Docker de Dokploy

#### Configurar DATABASE_URL en la Aplicación

Una vez que tengas la `DATABASE_URL`:

1. Ve a la configuración de tu aplicación **Backend** en Dokploy
2. Ve a **"Environment Variables"**
3. Agrega la variable:
   ```
   DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db?schema=public
   ```
4. **Importante**: Las migraciones de Prisma se ejecutarán automáticamente al iniciar el contenedor gracias al Dockerfile

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
