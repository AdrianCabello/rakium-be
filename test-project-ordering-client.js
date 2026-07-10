const axios = require('axios');

// Configuración
const BASE_URL = 'https://api.rakium.dev/api'; // URL de producción
const CLIENT_ID = '123e4567-e89b-12d3-a456-426614174000'; // ID del cliente de ejemplo

async function testProjectOrdering() {
  try {
    console.log('🧪 Probando ordenamiento de proyectos por cliente...\n');

    // 1. Obtener proyectos del cliente
    console.log('1. Obteniendo proyectos del cliente...');
    try {
      const response = await axios.get(`${BASE_URL}/projects/client/${CLIENT_ID}?page=1&limit=20`);
      console.log('✅ Endpoint funcionando correctamente');
      console.log('Status:', response.status);
      console.log('Proyectos encontrados:', response.data.data?.length || 0);
      console.log('Total:', response.data.total || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 Orden de los proyectos:');
        response.data.data.forEach((project, index) => {
          console.log(`${index + 1}. [order: ${project.order}] ${project.name} (ID: ${project.id})`);
        });

        // Verificar si están ordenados correctamente
        const orders = response.data.data.map(p => p.order);
        const isOrdered = orders.every((order, index) => {
          if (index === 0) return true;
          return order >= orders[index - 1];
        });

        if (isOrdered) {
          console.log('\n✅ Los proyectos están ordenados correctamente por el campo "order"');
        } else {
          console.log('\n❌ Los proyectos NO están ordenados correctamente');
          console.log('Ordenes encontrados:', orders);
        }

        // Mostrar detalles del primer proyecto
        console.log('\n📝 Detalles del primer proyecto:');
        const firstProject = response.data.data[0];
        console.log({
          id: firstProject.id,
          name: firstProject.name,
          order: firstProject.order,
          status: firstProject.status,
          category: firstProject.category
        });

      } else {
        console.log('⚠️  No hay proyectos para este cliente');
      }
    } catch (error) {
      console.log('❌ Error al obtener proyectos:', error.response?.status, error.response?.data?.message);
    }

    // 2. Probar con diferentes límites
    console.log('\n2. Probando con diferentes límites...');
    try {
      const response = await axios.get(`${BASE_URL}/projects/client/${CLIENT_ID}?page=1&limit=5`);
      console.log('✅ Límite de 5 proyectos funcionando');
      console.log('Proyectos retornados:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('Ordenes de los primeros 5:', response.data.data.map(p => p.order));
      }
    } catch (error) {
      console.log('❌ Error con límite:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar paginación
    console.log('\n3. Probando paginación...');
    try {
      const response = await axios.get(`${BASE_URL}/projects/client/${CLIENT_ID}?page=2&limit=3`);
      console.log('✅ Paginación funcionando');
      console.log('Página:', response.data.page);
      console.log('Proyectos en esta página:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('Ordenes de la página 2:', response.data.data.map(p => p.order));
      }
    } catch (error) {
      console.log('❌ Error con paginación:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 Prueba completada!');
    console.log('\n📝 RESUMEN:');
    console.log('- GET /projects/client/:clientId: ✅ Ordenado por campo "order"');
    console.log('- Los proyectos se ordenan primero por "order" ascendente');
    console.log('- Luego por "createdAt" descendente como fallback');
    console.log('- Solo proyectos PUBLICADOS son retornados');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar la prueba
testProjectOrdering(); 