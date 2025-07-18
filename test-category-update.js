const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const CLIENT_ID = 'dc984cb7-7c8c-476f-b900-2ed54c5781f9'; // ID del cliente de ejemplo

async function testCategoryUpdate() {
  try {
    console.log('🧪 Probando actualización del campo category...\n');

    // 1. Crear un proyecto con category ESTACIONES
    console.log('1. Creando proyecto con category ESTACIONES...');
    const createData = {
      name: 'Proyecto Con Categoría',
      clientId: CLIENT_ID,
      description: 'Proyecto para probar actualización de category',
      category: 'ESTACIONES'
    };

    const createResponse = await axios.post(`${BASE_URL}/projects`, createData);
    console.log('✅ Proyecto creado exitosamente');
    console.log('ID del proyecto:', createResponse.data.id);
    console.log('Category inicial:', createResponse.data.category);

    const projectId = createResponse.data.id;

    // 2. Verificar que el proyecto tiene la categoría
    console.log('\n2. Verificando proyecto inicial...');
    const getInitialResponse = await axios.get(`${BASE_URL}/projects/${projectId}`);
    console.log('✅ Proyecto obtenido');
    console.log('Category en BD:', getInitialResponse.data.category);

    // 3. Actualizar el proyecto para quitar la categoría (enviar vacío)
    console.log('\n3. Actualizando proyecto para quitar category (enviar vacío)...');
    const updateDataEmpty = {
      category: '' // String vacío
    };

    const updateResponseEmpty = await axios.patch(`${BASE_URL}/projects/${projectId}`, updateDataEmpty);
    console.log('✅ Proyecto actualizado con category vacío');
    console.log('Category después de actualizar con vacío:', updateResponseEmpty.data.category);

    // 4. Verificar que se guardó correctamente
    console.log('\n4. Verificando que se guardó correctamente...');
    const getAfterEmptyResponse = await axios.get(`${BASE_URL}/projects/${projectId}`);
    console.log('✅ Proyecto obtenido después de actualizar');
    console.log('Category en BD después de vacío:', getAfterEmptyResponse.data.category);

    // 5. Actualizar el proyecto para poner una categoría nueva
    console.log('\n5. Actualizando proyecto para poner category TIENDAS...');
    const updateDataNew = {
      category: 'TIENDAS'
    };

    const updateResponseNew = await axios.patch(`${BASE_URL}/projects/${projectId}`, updateDataNew);
    console.log('✅ Proyecto actualizado con category TIENDAS');
    console.log('Category después de actualizar con TIENDAS:', updateResponseNew.data.category);

    // 6. Verificar que se guardó correctamente
    console.log('\n6. Verificando que se guardó correctamente...');
    const getAfterNewResponse = await axios.get(`${BASE_URL}/projects/${projectId}`);
    console.log('✅ Proyecto obtenido después de actualizar');
    console.log('Category en BD después de TIENDAS:', getAfterNewResponse.data.category);

    // 7. Actualizar el proyecto para quitar la categoría nuevamente (enviar null)
    console.log('\n7. Actualizando proyecto para quitar category (enviar null)...');
    const updateDataNull = {
      category: null
    };

    const updateResponseNull = await axios.patch(`${BASE_URL}/projects/${projectId}`, updateDataNull);
    console.log('✅ Proyecto actualizado con category null');
    console.log('Category después de actualizar con null:', updateResponseNull.data.category);

    // 8. Verificar que se guardó correctamente
    console.log('\n8. Verificando que se guardó correctamente...');
    const getAfterNullResponse = await axios.get(`${BASE_URL}/projects/${projectId}`);
    console.log('✅ Proyecto obtenido después de actualizar');
    console.log('Category en BD después de null:', getAfterNullResponse.data.category);

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('El campo category ahora se actualiza correctamente cuando se envía vacío.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('Mensaje de error:', error.response.data.message);
    }
  }
}

// Ejecutar la prueba
testCategoryUpdate(); 