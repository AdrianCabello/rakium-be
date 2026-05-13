#!/bin/bash

# Script para importar dump desde dentro del servidor de Dokploy
# Este script debe ejecutarse en el servidor de Dokploy o desde un contenedor con acceso a la red interna

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📥 Importar Dump a Dokploy (desde servidor)${NC}"
echo ""

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar el archivo de dump${NC}"
    echo "Uso: ./scripts/import-dump-via-dokploy.sh [archivo-dump.sql] [DATABASE_URL]"
    echo ""
    echo "Ejemplo:"
    echo "  ./scripts/import-dump-via-dokploy.sh railway-dump.sql 'postgresql://user:password@dokploy-db-host:5432/rakium_production'"
    exit 1
fi

DUMP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo $DUMP_FILE no existe${NC}"
    exit 1
fi

# Obtener DATABASE_URL de Dokploy
if [ -z "$2" ]; then
    echo -e "${YELLOW}⚠️  No se proporcionó DATABASE_URL${NC}"
    echo "Por favor, ingresa la DATABASE_URL de tu base de datos en Dokploy:"
    echo "Formato: postgresql://usuario:password@host:puerto/nombre_db"
    read -p "DATABASE_URL: " DOKPLOY_DB_URL
else
    DOKPLOY_DB_URL="$2"
fi

if [ -z "$DOKPLOY_DB_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL es requerida${NC}"
    exit 1
fi

# Verificar que psql esté instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql no está instalado.${NC}"
    echo "Instala PostgreSQL client o usa Docker:"
    echo "  docker run --rm -i -v \$(pwd):/dumps postgres:16-alpine psql \"$DOKPLOY_DB_URL\" < \"$DUMP_FILE\""
    exit 1
fi

echo -e "${YELLOW}📦 Importando dump...${NC}"
echo "Archivo: $DUMP_FILE"
echo "Destino: Dokploy"
echo ""
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto sobrescribirá los datos existentes en la base de datos de Dokploy${NC}"
read -p "¿Continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo "Importando..."

# Remover el parámetro schema de la URL si existe (psql no lo acepta en la URI)
DOKPLOY_DB_URL_CLEAN=$(echo "$DOKPLOY_DB_URL" | sed 's/?schema=public//' | sed 's/&schema=public//')

# Importar el dump
psql "$DOKPLOY_DB_URL_CLEAN" < "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Dump importado exitosamente!${NC}"
    echo ""
    echo "La base de datos de Dokploy ahora tiene los datos de Railway."
    echo ""
    echo "Próximos pasos:"
    echo "1. Verifica que la aplicación en Dokploy esté configurada con la DATABASE_URL correcta"
    echo "2. Reinicia la aplicación en Dokploy"
else
    echo ""
    echo -e "${RED}❌ Error al importar el dump${NC}"
    exit 1
fi
