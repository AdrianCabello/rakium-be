#!/bin/bash

# Script alternativo: Importar dump usando un script de inicialización
# Este script puede ejecutarse manualmente después del despliegue

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}📥 Importar Dump - Método Alternativo${NC}"
echo ""

# Verificar que tenemos el dump
DUMP_FILE="${1:-}"

if [ -z "$DUMP_FILE" ]; then
    echo -e "${RED}Error: debes indicar la ruta del dump local${NC}"
    echo "Uso: ./scripts/import-via-init-script.sh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql"
    exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo de dump${NC}"
    echo "Archivo esperado: $DUMP_FILE"
    exit 1
fi

echo -e "${YELLOW}Este script creará un archivo que puedes ejecutar manualmente en Dokploy${NC}"
echo ""

# Crear script de importación
cat > import-dump-manual.sh << 'SCRIPT'
#!/bin/sh
# Script para ejecutar dentro del contenedor de Dokploy
# Copia este contenido y ejecútalo en el terminal de Dokploy

echo "Verificando conexión a la base de datos..."
psql "$DATABASE_URL" -c "SELECT version();" || {
    echo "Error: No se puede conectar a la base de datos"
    echo "Verifica que DATABASE_URL esté configurada correctamente"
    exit 1
}

echo "Importando dump..."
# El dump debe estar en /tmp/dump.sql (copiado manualmente o vía volumen)
if [ -f /tmp/dump.sql ]; then
    psql "$DATABASE_URL" < /tmp/dump.sql
    echo "✅ Dump importado exitosamente"
    rm -f /tmp/dump.sql
else
    echo "❌ Error: No se encontró /tmp/dump.sql"
    echo "Asegúrate de copiar el dump al contenedor primero"
    exit 1
fi
SCRIPT

chmod +x import-dump-manual.sh

echo -e "${GREEN}✅ Script creado: import-dump-manual.sh${NC}"
echo ""
echo "Para usar este método:"
echo "1. Sube el dump a Dokploy (usando un volumen o copiándolo manualmente)"
echo "2. Conéctate al contenedor de tu aplicación Backend en Dokploy"
echo "3. Copia el contenido de import-dump-manual.sh y ejecútalo"
echo ""
