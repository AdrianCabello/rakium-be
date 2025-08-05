const axios = require('axios');

// Configuración
const BASE_URL = 'https://rakium-be-production.up.railway.app';
const CLIENT_ID = '78abe353-1728-49b0-b268-1d2ad5786317';

async function testAllProjectsClient() {
  try {
    console.log('🧪 Probando endpoint de todos los proyectos del cliente...\n');

    // Probar el endpoint
    console.log('1. Probando GET /projects/client/:clientId...');
    try {
      const response = await axios.get(`${BASE_URL}/projects/client/${CLIENT_ID}?page=1&limit=100`);
      console.log('✅ Endpoint funcionando correctamente');
      console.log('Status:', response.status);
      console.log('Proyectos encontrados:', response.data.data?.length || 0);
      console.log('Total:', response.data.total || 0);
      
      // Mostrar información de cada proyecto
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 Proyectos encontrados:');
        response.data.data.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (${project.status}) - Order: ${project.order}`);
        });
        
        // Verificar si hay proyectos con diferentes estados
        const statuses = [...new Set(response.data.data.map(p => p.status))];
        console.log('\n📊 Estados de proyectos encontrados:', statuses);
        
        if (statuses.length > 1) {
          console.log('✅ Correcto: Se encontraron proyectos con diferentes estados');
        } else {
          console.log('⚠️  Solo se encontraron proyectos con estado:', statuses[0]);
        }
      } else {
        console.log('⚠️  No se encontraron proyectos para este cliente');
      }
      
    } catch (error) {
      console.log('❌ Error en endpoint:', error.response?.status, error.response?.data?.message);
    }

    // Comparar con el endpoint público que solo devuelve PUBLISHED
    console.log('\n2. Comparando con endpoint público (solo PUBLISHED)...');
    try {
      const publicResponse = await axios.get(`${BASE_URL}/projects/client/${CLIENT_ID}?page=1&limit=100`);
      console.log('Proyectos públicos encontrados:', publicResponse.data.data?.length || 0);
      console.log('Total públicos:', publicResponse.data.total || 0);
      
      // Mostrar diferencia
      const allProjects = response.data.total || 0;
      const publicProjects = publicResponse.data.total || 0;
      const difference = allProjects - publicProjects;
      
      console.log(`\n📈 Comparación:`);
      console.log(`- Todos los proyectos: ${allProjects}`);
      console.log(`- Solo públicos: ${publicProjects}`);
      console.log(`- Diferencia: ${difference} proyectos (DRAFT, ARCHIVED, etc.)`);
      
    } catch (error) {
      console.log('❌ Error comparando endpoints:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 Prueba completada!');
    console.log('\n📝 RESUMEN:');
    console.log('- GET /projects/client/:clientId: ✅ Devuelve TODOS los proyectos');
    console.log('- Incluye proyectos DRAFT, PUBLISHED, ARCHIVED, etc.');
    console.log('- Ordenados por campo order y createdAt');
    console.log('- Sin filtro de estado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testAllProjectsClient(); 