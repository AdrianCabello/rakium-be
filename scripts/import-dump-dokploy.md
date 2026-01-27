# Cómo Importar el Dump en Dokploy

Como `rakium-database-nnbukr` es un hostname interno de Docker, necesitas ejecutar la importación desde dentro de la red de Dokploy.

## Opción 1: Usar el Terminal/Console de Dokploy (Más Fácil)

1. **En el panel de Dokploy, ve a tu aplicación "Backend"**
2. **Busca la opción "Terminal", "Console", "Execute" o "Run Command"**
3. **Sube el archivo de dump:**
   - Busca una opción para subir archivos o usar un volumen
   - O copia el contenido del dump y pégalo en un archivo temporal

4. **Ejecuta el comando de importación:**
   ```bash
   # Si tienes psql disponible en el contenedor
   psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < /ruta/al/dump.sql
   
   # O usando el cliente de Prisma (si está disponible)
   npx prisma db execute --file /ruta/al/dump.sql --schema prisma/schema.prisma
   ```

## Opción 2: Crear un Contenedor Temporal en Dokploy

1. **En Dokploy, crea una nueva aplicación temporal:**
   - Nombre: `db-import-temp`
   - Tipo: Docker Image
   - Imagen: `postgres:16-alpine`
   - Red: Misma red que `rakium-database-nnbukr`

2. **Sube el archivo de dump al contenedor** (usando volúmenes o upload)

3. **Ejecuta el comando de importación:**
   ```bash
   psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < /dumps/railway-dump-20260127-201435.sql
   ```

4. **Elimina el contenedor temporal** después de la importación

## Opción 3: Usar Docker Compose o CLI desde el Servidor

Si tienes acceso SSH al servidor donde corre Dokploy:

```bash
# Conectarte al servidor
ssh usuario@servidor-dokploy

# Navegar al directorio de Dokploy (ajusta la ruta)
cd /ruta/dokploy

# Subir el dump al servidor primero
# (desde tu máquina local)
scp ./dumps/railway-dump-20260127-201435.sql usuario@servidor:/tmp/

# En el servidor, ejecutar:
docker run --rm -i \
  --network dokploy_default \
  -v /tmp:/dumps \
  postgres:16-alpine \
  psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' < /dumps/railway-dump-20260127-201435.sql
```

## Opción 4: Usar Prisma Studio o Migraciones

Si Dokploy tiene acceso a ejecutar comandos en tu aplicación Backend:

1. **Sube el dump a un lugar accesible** (S3, volumen, etc.)

2. **Modifica temporalmente el Dockerfile** para importar el dump al iniciar:
   ```dockerfile
   # Agregar al final del Dockerfile antes del CMD
   COPY dumps/railway-dump-20260127-201435.sql /tmp/dump.sql
   ```

3. **Modifica el CMD** para importar antes de iniciar:
   ```dockerfile
   CMD ["sh", "-c", "psql $DATABASE_URL < /tmp/dump.sql && node dist/src/main"]
   ```

4. **Despliega y luego revierte los cambios**

## Verificación

Después de importar, verifica que los datos estén correctos:

```bash
# Desde el terminal de Dokploy o un contenedor con acceso
psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' -c "SELECT COUNT(*) FROM \"Client\";"
psql 'postgresql://rakium_user:Troyanos22@rakium-database-nnbukr:5432/rakium_production' -c "SELECT COUNT(*) FROM projects;"
```

## Notas Importantes

- ⚠️ **El dump sobrescribirá todos los datos existentes** en la base de datos
- ✅ Asegúrate de tener un backup antes de importar
- ✅ El archivo de dump está en: `./dumps/railway-dump-20260127-201435.sql`
- ✅ Tamaño: ~94KB
