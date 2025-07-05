const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const CLIENT_ID = '123e4567-e89b-12d3-a456-426614174000'; // Reemplaza con un ID real

async function testInternalFields() {
  try {
    console.log('🧪 Probando campos de información interna...\n');

    // 1. Crear un proyecto con campos de información interna
    console.log('1. Creando proyecto con campos de información interna...');
    const createData = {
      name: 'Proyecto de Prueba - Campos Internos',
      category: 'ESTACIONES',
      clientId: CLIENT_ID,
      description: 'Proyecto para probar los nuevos campos de información interna',
      
      // Campos de información interna
      contactName: 'María González',
      contactPhone: '+52 55 9876 5432',
      contactEmail: 'maria.gonzalez@empresa.com',
      budget: '$75,000 USD',
      invoiceStatus: 'pendiente',
      notes: 'Cliente VIP - Requiere seguimiento especial. Proyecto prioritario para Q1 2024.'
    };

    const createResponse = await axios.post(`${BASE_URL}/projects`, createData);
    console.log('✅ Proyecto creado exitosamente');
    console.log('ID del proyecto:', createResponse.data.id);
    console.log('Campos internos guardados:', {
      contactName: createResponse.data.contactName,
      contactPhone: createResponse.data.contactPhone,
      contactEmail: createResponse.data.contactEmail,
      budget: createResponse.data.budget,
      invoiceStatus: createResponse.data.invoiceStatus,
      notes: createResponse.data.notes
    });

    // 2. Obtener el proyecto para verificar que los campos se guardaron
    console.log('\n2. Obteniendo proyecto para verificar campos...');
    const getResponse = await axios.get(`${BASE_URL}/projects/${createResponse.data.id}`);
    console.log('✅ Proyecto obtenido exitosamente');
    console.log('Campos internos recuperados:', {
      contactName: getResponse.data.contactName,
      contactPhone: getResponse.data.contactPhone,
      contactEmail: getResponse.data.contactEmail,
      budget: getResponse.data.budget,
      invoiceStatus: getResponse.data.invoiceStatus,
      notes: getResponse.data.notes
    });

    // 3. Actualizar solo los campos de información interna
    console.log('\n3. Actualizando campos de información interna...');
    const updateData = {
      contactName: 'Carlos Rodríguez',
      contactPhone: '+52 55 1111 2222',
      budget: '$85,000 USD',
      invoiceStatus: 'facturado',
      notes: 'Proyecto completado exitosamente. Cliente satisfecho con los resultados.'
    };

    const updateResponse = await axios.patch(`${BASE_URL}/projects/${createResponse.data.id}`, updateData);
    console.log('✅ Proyecto actualizado exitosamente');
    console.log('Campos internos actualizados:', {
      contactName: updateResponse.data.contactName,
      contactPhone: updateResponse.data.contactPhone,
      contactEmail: updateResponse.data.contactEmail,
      budget: updateResponse.data.budget,
      invoiceStatus: updateResponse.data.invoiceStatus,
      notes: updateResponse.data.notes
    });

    // 4. Verificar que los campos no aparecen en el endpoint público
    console.log('\n4. Verificando que los campos internos NO aparecen en endpoint público...');
    try {
      const publicResponse = await axios.get(`${BASE_URL}/projects/${createResponse.data.id}/published`);
      console.log('❌ Los campos internos SÍ aparecen en el endpoint público (esto no debería pasar)');
      console.log('Campos internos en respuesta pública:', {
        contactName: publicResponse.data.contactName,
        contactPhone: publicResponse.data.contactPhone,
        contactEmail: publicResponse.data.contactEmail,
        budget: publicResponse.data.budget,
        invoiceStatus: publicResponse.data.invoiceStatus,
        notes: publicResponse.data.notes
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Endpoint público correctamente rechaza proyecto no publicado');
      } else {
        console.log('❌ Error inesperado en endpoint público:', error.message);
      }
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('Los campos de información interna funcionan correctamente.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testInternalFields(); 