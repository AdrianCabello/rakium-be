# Rakium API - Colección de Bruno

Esta colección de Bruno contiene todos los endpoints de la API de Rakium para testing y desarrollo.

## 🚀 Configuración Inicial

### 1. Importar la colección
1. Abre Bruno
2. Haz clic en "Import Collection"
3. Selecciona la carpeta `bruno/rakium-api`

### 2. Configurar variables de entorno
1. Selecciona el entorno "Production" o "Local"
2. Ejecuta primero el endpoint "Login" para obtener el token de autenticación
3. El token se guardará automáticamente en la variable `authToken`

### 3. Obtener IDs necesarios
1. Ejecuta "Get All Clients" para obtener un `clientId`
2. Los IDs se guardarán automáticamente en las variables de entorno

## 📋 Estructura de la Colección

### 🔐 Auth (3 endpoints)
- **Login** - Autenticación y obtención de token
- **Get Profile** - Información del usuario autenticado
- **Test Auth** - Verificar autenticación

### 📁 Projects (10 endpoints)
- **Get All Projects** - Listar todos los proyectos con paginación
- **Create Project** - Crear nuevo proyecto (incluye nuevos campos: githubUrl, demoUrl, technologies)
- **Get Project by ID** - Obtener proyecto específico
- **Update Project** - Actualizar proyecto
- **Get Featured Projects** - Proyectos destacados
- **Get Published Project (Public)** - Proyecto publicado (público)
- **Get Projects by Client (Public)** - Proyectos por cliente (público)
- **Reorder Projects** - Reordenar proyectos
- **Set Project Order** - Establecer orden específico
- **Delete Project** - Eliminar proyecto

### 👥 Clients (5 endpoints)
- **Get All Clients** - Listar todos los clientes
- **Create Client** - Crear nuevo cliente
- **Get Client by ID** - Obtener cliente específico
- **Update Client** - Actualizar cliente
- **Delete Client** - Eliminar cliente

### 👤 Users (5 endpoints)
- **Get All Users** - Listar todos los usuarios
- **Create User** - Crear nuevo usuario
- **Get User by ID** - Obtener usuario específico
- **Update User** - Actualizar usuario
- **Delete User** - Eliminar usuario

### 🖼️ Gallery (7 endpoints)
- **Get Gallery Images** - Listar imágenes de galería
- **Get Public Gallery** - Galería pública
- **Add Gallery Image** - Agregar imagen a galería
- **Get Gallery Image by ID** - Obtener imagen específica
- **Update Gallery Image** - Actualizar imagen
- **Reorder Gallery Images** - Reordenar imágenes
- **Delete Gallery Image** - Eliminar imagen

### 🎥 Videos (7 endpoints)
- **Get All Videos** - Listar todos los videos
- **Get Public Videos** - Videos públicos
- **Add Video** - Agregar video de YouTube
- **Get Video by ID** - Obtener video específico
- **Update Video** - Actualizar video
- **Reorder Videos** - Reordenar videos
- **Delete Video** - Eliminar video

### 📤 Upload (5 endpoints)
- **Test Upload (Public)** - Upload de prueba (público)
- **Upload File** - Subir archivo a Backblaze B2
- **Upload Image with Variants** - Subir imagen con variantes optimizadas
- **Upload to Project Gallery** - Subir directamente a galería de proyecto
- **Upload Image Variants** - Subir imagen con múltiples variantes

## 🆕 Nuevos Campos en Projects

Los proyectos ahora incluyen los siguientes campos nuevos:

### `githubUrl` (string, nullable)
- URL del repositorio de GitHub del proyecto
- Ejemplo: `"https://github.com/usuario/proyecto"`

### `demoUrl` (string, nullable)
- URL de demostración del proyecto
- Ejemplo: `"https://demo-proyecto.com"`

### `technologies` (JSON array, nullable)
- Array de tecnologías utilizadas (funciona como chips)
- **Entrada**: `"React, TypeScript, Node.js"`
- **Salida**: `["React", "TypeScript", "Node.js"]`

## 🔄 Flujo de Testing Recomendado

1. **Autenticación**
   - Ejecutar "Login" para obtener token

2. **Configuración inicial**
   - Ejecutar "Get All Clients" para obtener clientId
   - Ejecutar "Get All Projects" para ver proyectos existentes

3. **Testing CRUD completo**
   - Crear proyecto con nuevos campos
   - Actualizar proyecto
   - Agregar imágenes a galería
   - Agregar videos
   - Probar endpoints públicos

4. **Testing de upload**
   - Probar upload de archivos
   - Probar upload con variantes
   - Probar upload directo a galería

5. **Limpieza**
   - Eliminar recursos creados durante las pruebas

## 🌐 URLs de la API

- **Producción**: `https://rakium-be-production.up.railway.app`
- **Local**: `http://localhost:3000`
- **Swagger**: `https://rakium-be-production.up.railway.app/api`

## 📝 Notas Importantes

- Todos los endpoints que requieren autenticación usan Bearer Token
- Los endpoints marcados como "Public" no requieren autenticación
- Las variables de entorno se actualizan automáticamente durante las pruebas
- Los archivos de prueba deben estar en la carpeta raíz del proyecto
- La colección incluye tests automatizados para validar respuestas

## 🐛 Troubleshooting

### Error 401 (Unauthorized)
- Verificar que el token de autenticación esté configurado
- Ejecutar "Login" nuevamente para obtener un token fresco

### Error 404 (Not Found)
- Verificar que los IDs en las variables de entorno sean correctos
- Ejecutar los endpoints de "Get All" para obtener IDs válidos

### Error 400 (Bad Request)
- Verificar que el body de la petición tenga el formato correcto
- Revisar que los campos requeridos estén presentes

---

**Fecha de creación**: 17 de Agosto, 2024
**Versión de la API**: 1.0
**Última actualización**: Incluye nuevos campos githubUrl, demoUrl y technologies
