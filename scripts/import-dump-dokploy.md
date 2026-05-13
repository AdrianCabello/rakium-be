# Importar dump en Dokploy

La base de datos de Dokploy suele vivir en una red interna de Docker. Por eso, la importacion debe ejecutarse desde el servidor o desde un contenedor temporal que pueda ver esa red.

## Opcion 1: Terminal de Dokploy

1. Abre el terminal/console de la aplicacion o del servicio de base de datos.
2. Sube el dump por un canal temporal seguro.
3. Ejecuta:

```bash
psql 'postgresql://USER:PASSWORD@DOKPLOY_DB_HOST:5432/DB?schema=public' < /ruta/al/dump.sql
```

## Opcion 2: Contenedor temporal

Desde el servidor de Dokploy:

```bash
docker run --rm -i \
  --network dokploy_default \
  -v /tmp/rakium-dumps:/dumps \
  postgres:16-alpine \
  psql 'postgresql://USER:PASSWORD@DOKPLOY_DB_HOST:5432/DB?schema=public' \
  < /dumps/railway-dump-YYYYMMDD-HHMMSS.sql
```

Despues de importar, elimina el dump:

```bash
rm -f /tmp/rakium-dumps/railway-dump-*.sql
```

## Verificacion

```bash
psql 'postgresql://USER:PASSWORD@DOKPLOY_DB_HOST:5432/DB?schema=public' -c 'SELECT COUNT(*) FROM "Client";'
psql 'postgresql://USER:PASSWORD@DOKPLOY_DB_HOST:5432/DB?schema=public' -c 'SELECT COUNT(*) FROM projects;'
```

## Reglas de seguridad

- No copies dumps dentro de la imagen de la aplicacion.
- No modifiques el Dockerfile para importar dumps.
- No cambies el comando de arranque de produccion para importar datos.
- No subas dumps ni URLs reales al repositorio.
- Borra el dump del servidor despues de validar la importacion.
