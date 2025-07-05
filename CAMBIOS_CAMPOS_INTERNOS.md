# Campos de Información Interna - Proyectos

## Resumen de Cambios

Se han agregado 6 campos opcionales de información interna al modelo de proyecto para uso exclusivo de gestión interna, no visibles al público.

### Campos Agregados

1. **contactName** (string, opcional): Nombre de contacto interno
2. **contactPhone** (string, opcional): Teléfono de contacto interno  
3. **contactEmail** (string, opcional): Email de contacto interno
4. **budget** (string, opcional): Presupuesto estimado o real del proyecto
5. **invoiceStatus** (string, opcional): Estado de facturación (ej: pendiente, facturado, etc.)
6. **notes** (string, opcional): Notas internas o comentarios adicionales

### Archivos Modificados

#### 1. Esquema de Base de Datos
- **Archivo**: `prisma/schema.prisma`
- **Cambios**: Agregados los 6 campos al modelo `Project`
- **Migración**: `20250705191130_add_internal_project_fields`

#### 2. DTOs
- **Archivo**: `src/dto/create-project.dto.ts`
- **Cambios**: Agregados los campos con validaciones y documentación Swagger

- **Archivo**: `src/dto/update-project.dto.ts`  
- **Cambios**: Agregados los campos con validaciones y documentación Swagger

#### 3. Servicio
- **Archivo**: `src/projects/projects.service.ts`
- **Cambios**: 
  - Método `create()`: Incluye los nuevos campos en la creación
  - Método `update()`: Incluye los nuevos campos en la actualización

### Características de los Campos

✅ **Opcionales**: Todos los campos son opcionales
✅ **Internos**: Solo para uso de gestión interna
✅ **Validados**: Incluyen validaciones de tipo string
✅ **Documentados**: Incluyen documentación Swagger completa
✅ **Persistentes**: Se guardan en la base de datos PostgreSQL

### Ejemplo de Uso

```json
{
  "name": "Proyecto de Ejemplo",
  "category": "ESTACIONES",
  "clientId": "123e4567-e89b-12d3-a456-426614174000",
  
  // Campos de información interna
  "contactName": "Juan Pérez",
  "contactPhone": "+52 55 1234 5678",
  "contactEmail": "contacto@empresa.com",
  "budget": "$50,000 USD",
  "invoiceStatus": "pendiente",
  "notes": "Cliente VIP, requiere atención especial"
}
```

### Endpoints Afectados

- `POST /projects` - Crear proyecto (acepta campos internos)
- `PATCH /projects/:id` - Actualizar proyecto (acepta campos internos)
- `GET /projects/:id` - Obtener proyecto (incluye campos internos)
- `GET /projects` - Listar proyectos (incluye campos internos)

### Notas Importantes

1. **Seguridad**: Los campos internos están disponibles en todos los endpoints autenticados
2. **Público**: Los endpoints públicos (`/projects/:id/published`) no deberían exponer estos campos
3. **Migración**: La migración se ejecutó automáticamente y está lista para producción
4. **Validación**: Todos los campos incluyen validaciones apropiadas

### Pruebas

Se incluye un script de prueba (`test-internal-fields.js`) para verificar el funcionamiento de los nuevos campos.

### Estado de Implementación

✅ Esquema de base de datos actualizado
✅ Migración ejecutada
✅ DTOs actualizados
✅ Servicio actualizado
✅ Cliente Prisma regenerado
✅ Build exitoso
✅ Documentación completa 