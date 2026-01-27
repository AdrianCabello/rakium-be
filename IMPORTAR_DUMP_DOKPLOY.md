# Guía Rápida: Importar Dump en Dokploy

## ⚠️ Si recibes "No such container" - Usa el Método del Dockerfile

Si el terminal de Dokploy no está disponible o el contenedor no está corriendo, **usa el método del Dockerfile temporal** (Método 2 abajo). Es más confiable y automático.

## Método 1: Usar el Terminal de Dokploy (Solo si el contenedor está corriendo)

### Paso 1: Subir el dump a Dokploy

1. En el panel de Dokploy, ve a tu aplicación **Backend**
2. Busca la opción **"Terminal"**, **"Console"**, **"Execute"** o **"Run Command"**
3. Si hay opción de subir archivos, sube: `./dumps/railway-dump-20260127-201435.sql`
   - O copia el contenido del archivo y créalo en el servidor

### Paso 2: Ejecutar el comando de importación

Desde el terminal de Dokploy, ejecuta:

```bash
# Instalar PostgreSQL client si no está disponible
apk add --no-cache postgresql-client

# Importar el dump
psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < /ruta/al/railway-dump-20260127-201435.sql
```

## Método 2: Dockerfile Temporal (RECOMENDADO - Más Confiable)

Este método importa el dump automáticamente durante el build. Es la mejor opción si el terminal no está disponible:

### Paso 1: Asegurarte de que el dump esté en el repositorio

El dump ya está agregado al staging. Solo necesitas hacer commit y push:

```bash
# Verificar que el dump esté listo
git status dumps/railway-dump-20260127-201435.sql

# Hacer commit y push
git commit -m "Agregar dump de Railway para importación en Dokploy"
git push
```

### Paso 2: Configurar Dokploy para usar el Dockerfile temporal

1. En Dokploy, ve a la configuración de tu aplicación **Backend**
2. Busca **"Dockerfile Path"** o **"Build Settings"**
3. Cambia el Dockerfile Path de `Dockerfile` a: **`Dockerfile.with-dump`**
4. Guarda los cambios

### Paso 3: Desplegar

1. Haz clic en **"Deploy"** o **"Redeploy"** en Dokploy
2. Dokploy construirá la imagen con el Dockerfile temporal
3. El dump se importará automáticamente al iniciar el contenedor
4. Revisa los logs para ver el mensaje: `✅ Dump importado exitosamente`

### Paso 4: Revertir después de la importación

Una vez que veas en los logs que el dump se importó correctamente:

1. En Dokploy, cambia el Dockerfile Path de vuelta a: **`Dockerfile`**
2. Haz un nuevo deploy (esto usará el Dockerfile normal sin el dump)
3. Opcional: Elimina el dump del repositorio después:
   ```bash
   git rm dumps/railway-dump-20260127-201435.sql
   git commit -m "Eliminar dump después de importación exitosa"
   git push
   ```

## Verificar la Importación

Después de importar, verifica que los datos estén correctos. Desde el terminal de Dokploy o tu aplicación:

```bash
# Conectar a la base de datos y verificar
psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' -c "SELECT COUNT(*) FROM \"Client\";"
psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' -c "SELECT COUNT(*) FROM projects;"
```

O desde tu aplicación NestJS, puedes verificar en los logs que las tablas tengan datos.

## Credenciales de la Base de Datos

- **User:** `rakium_user`
- **Password:** `Troyanos22`
- **Database:** `rakium_production`
- **Host (interno):** `rakium-database-nnbukr`
- **Port:** `5432`
- **Connection URL:** `postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production`

## Notas Importantes

⚠️ **El dump sobrescribirá todos los datos existentes** en la base de datos de Dokploy

✅ El archivo de dump está en: `./dumps/railway-dump-20260127-201435.sql` (94KB)

✅ Después de importar, asegúrate de que tu aplicación Backend tenga configurada la `DATABASE_URL` correcta en las variables de entorno de Dokploy
