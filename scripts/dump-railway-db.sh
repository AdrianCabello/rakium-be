#!/bin/bash

# Script para hacer dump de la base de datos de Railway
# Uso: ./scripts/dump-railway-db.sh

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Dump de Base de Datos Railway${NC}"
echo ""

# Railway database URL must be provided by the caller.
# Example:
#   RAILWAY_DATABASE_URL='postgresql://user:password@host:port/database' ./scripts/dump-railway-db.sh
RAILWAY_DB_URL="${RAILWAY_DATABASE_URL:-${DATABASE_URL:-}}"

if [ -z "$RAILWAY_DB_URL" ]; then
    echo "Error: set RAILWAY_DATABASE_URL before running this script."
    exit 1
fi

# Nombre del archivo de dump
DUMP_FILE="railway-dump-$(date +%Y%m%d-%H%M%S).sql"
DUMP_DIR="./dumps"

# Crear directorio de dumps si no existe
mkdir -p "$DUMP_DIR"

echo -e "${YELLOW}📦 Creando dump de la base de datos...${NC}"
echo "Origen: Railway"
echo "Archivo: $DUMP_DIR/$DUMP_FILE"
echo ""

# Intentar usar PostgreSQL 16 si está disponible (Homebrew)
if [ -f "/opt/homebrew/opt/postgresql@16/bin/pg_dump" ]; then
    export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi

# Verificar versión de pg_dump y usar Docker si es necesario
USE_DOCKER=false

if command -v pg_dump &> /dev/null; then
    PG_DUMP_VERSION=$(pg_dump --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    echo "Versión de pg_dump detectada: $PG_DUMP_VERSION"
    
    # Si la versión es menor a 15, usar Docker
    if [ "$(printf '%s\n' "15.0" "$PG_DUMP_VERSION" | sort -V | head -n1)" != "15.0" ]; then
        echo -e "${YELLOW}⚠️  Versión de pg_dump ($PG_DUMP_VERSION) es antigua. Usando Docker...${NC}"
        USE_DOCKER=true
    fi
else
    echo -e "${YELLOW}⚠️  pg_dump no encontrado. Usando Docker...${NC}"
    USE_DOCKER=true
fi

# Hacer el dump
if [ "$USE_DOCKER" = true ]; then
    # Usar Docker con imagen PostgreSQL 16
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker no está instalado."
        echo "Instala Docker o actualiza PostgreSQL client:"
        echo "  macOS: brew upgrade postgresql@16"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql-client-16"
        exit 1
    fi
    
    echo "Usando Docker para crear el dump..."
    docker run --rm \
        -v "$(pwd)/$DUMP_DIR:/dumps" \
        postgres:16-alpine \
        pg_dump "$RAILWAY_DB_URL" \
            --verbose \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            --format=plain \
            --file="/dumps/$DUMP_FILE"
else
    # Usar pg_dump local (intentar con --no-version-check si está disponible)
    echo "Usando pg_dump local..."
    if pg_dump --help | grep -q "no-version-check"; then
        pg_dump "$RAILWAY_DB_URL" \
            --no-version-check \
            --verbose \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            --format=plain \
            --file="$DUMP_DIR/$DUMP_FILE"
    else
        pg_dump "$RAILWAY_DB_URL" \
            --verbose \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            --format=plain \
            --file="$DUMP_DIR/$DUMP_FILE"
    fi
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Dump creado exitosamente!${NC}"
    echo "📁 Archivo: $DUMP_DIR/$DUMP_FILE"
    echo ""
    echo "Tamaño del archivo:"
    ls -lh "$DUMP_DIR/$DUMP_FILE" | awk '{print $5}'
    echo ""
    echo "Para importar en Dokploy, ejecuta:"
    echo "  ./scripts/import-dump-to-dokploy.sh $DUMP_DIR/$DUMP_FILE"
else
    echo ""
    echo "❌ Error al crear el dump"
    exit 1
fi
