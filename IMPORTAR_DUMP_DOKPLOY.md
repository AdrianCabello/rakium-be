# Guía Rápida: Importar Dump en Dokploy

## Seguridad de dumps

Nunca subas dumps ni credenciales reales al repositorio. Si una credencial real quedó en Git o en documentación compartida, rótala antes de usar el entorno en producción.

## ⚠️ Si recibes "No such container"

Si el terminal de Dokploy no está disponible o el contenedor no está corriendo, usa un contenedor temporal con acceso a la red interna de Dokploy. No copies dumps dentro de la imagen de la aplicación.

## Método 1: Usar el Terminal de Dokploy (Solo si el contenedor está corriendo)

### Paso 1: Subir el dump a Dokploy

1. En el panel de Dokploy, ve a tu aplicación **Backend**
2. Busca la opción **"Terminal"**, **"Console"**, **"Execute"** o **"Run Command"**
3. Si hay opción de subir archivos, sube tu dump local: `./dumps/railway-dump-YYYYMMDD-HHMMSS.sql`
   - O copia el contenido del archivo y créalo en el servidor

### Paso 2: Ejecutar el comando de importación

Desde el terminal de Dokploy, ejecuta:

```bash
# Instalar PostgreSQL client si no está disponible
apk add --no-cache postgresql-client

# Importar el dump
psql 'postgresql://usuario:password@dokploy-db-host:5432/rakium_production' < /ruta/al/railway-dump-YYYYMMDD-HHMMSS.sql
```

## Método 2: Contenedor temporal de PostgreSQL client (recomendado)

Este método importa el dump desde un contenedor efímero en la red interna de Dokploy. No copies el dump dentro de la imagen de la aplicación ni lo importes durante el build:

### Paso 1: Mantener el dump fuera del repositorio

El dump debe existir sólo en tu máquina o en el servidor temporalmente:

```bash
ls -lh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql
```

### Paso 2: Usar un contenedor temporal de PostgreSQL client

1. Sube el dump al servidor por un canal seguro temporal.
2. Ejecuta un contenedor `postgres:16-alpine` en la misma red interna de Dokploy.
3. Importa usando la `DATABASE_URL` real configurada como variable de entorno o pegada sólo en la terminal segura.

```bash
docker run --rm -i \
  --network dokploy_default \
  -v /tmp:/dumps \
  postgres:16-alpine \
  psql 'postgresql://usuario:password@dokploy-db-host:5432/rakium_production' < /dumps/railway-dump-YYYYMMDD-HHMMSS.sql
```

### Paso 3: Limpiar después de la importación

Una vez que verifiques que el dump se importó correctamente, elimina el dump del servidor:

```bash
rm /tmp/railway-dump-YYYYMMDD-HHMMSS.sql
```

## Verificar la Importación

Después de importar, verifica que los datos estén correctos. Desde el terminal de Dokploy o tu aplicación:

```bash
# Conectar a la base de datos y verificar
psql 'postgresql://usuario:password@dokploy-db-host:5432/rakium_production' -c "SELECT COUNT(*) FROM \"Client\";"
psql 'postgresql://usuario:password@dokploy-db-host:5432/rakium_production' -c "SELECT COUNT(*) FROM projects;"
```

O desde tu aplicación NestJS, puedes verificar en los logs que las tablas tengan datos.

## Credenciales de la Base de Datos

- **User:** `usuario`
- **Password:** `password`
- **Database:** `rakium_production`
- **Host (interno):** `dokploy-db-host`
- **Port:** `5432`
- **Connection URL:** `postgresql://usuario:password@dokploy-db-host:5432/rakium_production`

## Notas Importantes

⚠️ **El dump sobrescribirá todos los datos existentes** en la base de datos de Dokploy

✅ Los dumps deben mantenerse fuera de Git y compartirse sólo por canales seguros temporales

✅ Después de importar, asegúrate de que tu aplicación Backend tenga configurada la `DATABASE_URL` correcta en las variables de entorno de Dokploy
