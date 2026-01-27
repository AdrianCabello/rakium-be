# Scripts de Migración de Base de Datos

Scripts útiles para migrar datos entre Railway y Dokploy.

## Requisitos

- PostgreSQL client instalado (`pg_dump` y `psql`)
  - macOS: `brew install postgresql`
  - Ubuntu/Debian: `sudo apt-get install postgresql-client`
  - Windows: Descarga desde https://www.postgresql.org/download/

## Scripts Disponibles

### 1. `dump-railway-db.sh`

Crea un dump completo de la base de datos de Railway.

**Uso:**
```bash
./scripts/dump-railway-db.sh
```

**Qué hace:**
- Conecta a la base de datos de Railway usando las credenciales del archivo `.env`
- Crea un archivo SQL con todos los datos y estructura
- Guarda el dump en `./dumps/railway-dump-YYYYMMDD-HHMMSS.sql`

**Nota:** Las credenciales de Railway están hardcodeadas en el script. Si cambian, actualiza el script.

### 2. `import-dump-to-dokploy.sh`

Importa un dump SQL a la base de datos de Dokploy.

**Uso:**
```bash
./scripts/import-dump-to-dokploy.sh [archivo-dump.sql] [DATABASE_URL_DOKPLOY]
```

**Ejemplo:**
```bash
./scripts/import-dump-to-dokploy.sh ./dumps/railway-dump-20250127-120000.sql 'postgresql://user:pass@host:5432/db?schema=public'
```

**Qué hace:**
- Importa el dump SQL a la base de datos especificada
- **ADVERTENCIA:** Esto sobrescribirá los datos existentes en la base de datos destino

## Proceso Completo de Migración

1. **Crear el dump desde Railway:**
   ```bash
   ./scripts/dump-railway-db.sh
   ```

2. **Crear la base de datos en Dokploy** (ver `DOKPLOY.md`)

3. **Importar el dump en Dokploy:**
   ```bash
   ./scripts/import-dump-to-dokploy.sh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql 'DATABASE_URL_DE_DOKPLOY'
   ```

4. **Verificar que los datos se importaron correctamente**

5. **Configurar la aplicación en Dokploy** con la nueva `DATABASE_URL`

## Troubleshooting

### Error: "pg_dump: command not found"
Instala el cliente de PostgreSQL (ver Requisitos arriba).

### Error: "connection refused" o "could not connect"
- Verifica que las credenciales de Railway sean correctas
- Asegúrate de que la base de datos de Railway esté accesible
- Verifica tu conexión a internet

### Error al importar: "permission denied"
- Verifica que la `DATABASE_URL` de Dokploy sea correcta
- Asegúrate de que el usuario tenga permisos para crear/eliminar tablas
- Verifica que la base de datos esté accesible desde tu máquina
