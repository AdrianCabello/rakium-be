const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const CLIENT_ID = 'dc984cb7-7c8c-476f-b900-2ed54c5781f9'; // ID del cliente de ejemplo

async function testCategoryEmpty() {
  try {
    console.log('🧪 Probando campo category vacío...\n');

    // 1. Crear un proyecto con category vacío
    console.log('1. Creando proyecto con category vacío...');
    const createData = {
      name: 'Proyecto Sin Categoría',
      clientId: CLIENT_ID,
      description: 'Proyecto para probar que category puede ser vacío',
      category: '' // Campo vacío
    };

    const createResponse = await axios.post(`${BASE_URL}/projects`, createData);
    console.log('✅ Proyecto creado exitosamente con category vacío');
    console.log('ID del proyecto:', createResponse.data.id);
    console.log('Category:', createResponse.data.category);

    // 2. Crear un proyecto con category null
    console.log('\n2. Creando proyecto con category null...');
    const createDataNull = {
      name: 'Proyecto Con Category Null',
      clientId: CLIENT_ID,
      description: 'Proyecto para probar que category puede ser null',
      category: null // Campo null
    };

    const createResponseNull = await axios.post(`${BASE_URL}/projects`, createDataNull);
    console.log('✅ Proyecto creado exitosamente con category null');
    console.log('ID del proyecto:', createResponseNull.data.id);
    console.log('Category:', createResponseNull.data.category);

    // 3. Crear un proyecto sin enviar category
    console.log('\n3. Creando proyecto sin enviar category...');
    const createDataNoCategory = {
      name: 'Proyecto Sin Enviar Category',
      clientId: CLIENT_ID,
      description: 'Proyecto para probar que category puede ser undefined'
    };

    const createResponseNoCategory = await axios.post(`${BASE_URL}/projects`, createDataNoCategory);
    console.log('✅ Proyecto creado exitosamente sin enviar category');
    console.log('ID del proyecto:', createResponseNoCategory.data.id);
    console.log('Category:', createResponseNoCategory.data.category);

    // 4. Actualizar un proyecto para quitar la categoría
    console.log('\n4. Actualizando proyecto para quitar la categoría...');
    const updateData = {
      category: '' // Cambiar a vacío
    };

    const updateResponse = await axios.patch(`${BASE_URL}/projects/${createResponse.data.id}`, updateData);
    console.log('✅ Proyecto actualizado exitosamente');
    console.log('Category después de actualizar:', updateResponse.data.category);

    // 5. Verificar que los proyectos se pueden obtener
    console.log('\n5. Verificando que los proyectos se pueden obtener...');
    const getResponse = await axios.get(`${BASE_URL}/projects/${createResponse.data.id}`);
    console.log('✅ Proyecto obtenido exitosamente');
    console.log('Category en respuesta:', getResponse.data.category);

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('El campo category ahora puede ser vacío, null o undefined.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('Mensaje de error:', error.response.data.message);
    }
  }
}

// Ejecutar la prueba
testCategoryEmpty(); 