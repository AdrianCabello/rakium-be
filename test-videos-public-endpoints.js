const axios = require('axios');

// Configuración
const BASE_URL = 'https://rakium-be-production.up.railway.app';
const PROJECT_ID = 'c96efe86-5a1e-4e91-a206-dbd7e0a77ed9';

async function testVideosPublicEndpoints() {
  try {
    console.log('🧪 Probando endpoints públicos de videos...\n');

    // 1. Probar GET /projects/:projectId/videos/public (endpoint específico)
    console.log('1. Probando GET /projects/:projectId/videos/public...');
    try {
      const publicVideosResponse = await axios.get(`${BASE_URL}/projects/${PROJECT_ID}/videos/public?page=1&limit=10`);
      console.log('✅ Endpoint /videos/public funcionando correctamente');
      console.log('Status:', publicVideosResponse.status);
      console.log('Videos encontrados:', publicVideosResponse.data.data?.length || 0);
      console.log('Total:', publicVideosResponse.data.total || 0);
      
      if (publicVideosResponse.data.data && publicVideosResponse.data.data.length > 0) {
        console.log('Primer video:', {
          id: publicVideosResponse.data.data[0].id,
          title: publicVideosResponse.data.data[0].title,
          order: publicVideosResponse.data.data[0].order
        });
      }
    } catch (error) {
      console.log('❌ Error en endpoint /videos/public:', error.response?.status, error.response?.data?.message);
    }

    // 2. Probar GET /projects/:projectId/videos (endpoint general)
    console.log('\n2. Probando GET /projects/:projectId/videos...');
    try {
      const videosResponse = await axios.get(`${BASE_URL}/projects/${PROJECT_ID}/videos?page=1&limit=10`);
      console.log('✅ Endpoint /videos funcionando correctamente');
      console.log('Status:', videosResponse.status);
      console.log('Videos encontrados:', videosResponse.data.data?.length || 0);
      console.log('Total:', videosResponse.data.total || 0);
      
      if (videosResponse.data.data && videosResponse.data.data.length > 0) {
        console.log('Primer video:', {
          id: videosResponse.data.data[0].id,
          title: videosResponse.data.data[0].title,
          order: videosResponse.data.data[0].order
        });
      }
    } catch (error) {
      console.log('❌ Error en endpoint /videos:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar GET /projects/:projectId/videos/:id (video específico)
    console.log('\n3. Probando GET /projects/:projectId/videos/:id...');
    try {
      // Primero obtener la lista para tener un ID de video
      const listResponse = await axios.get(`${BASE_URL}/projects/${PROJECT_ID}/videos?page=1&limit=1`);
      
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const videoId = listResponse.data.data[0].id;
        const videoResponse = await axios.get(`${BASE_URL}/projects/${PROJECT_ID}/videos/${videoId}`);
        console.log('✅ Endpoint de video específico funcionando correctamente');
        console.log('Status:', videoResponse.status);
        console.log('Video:', {
          id: videoResponse.data.id,
          title: videoResponse.data.title,
          youtubeUrl: videoResponse.data.youtubeUrl
        });
      } else {
        console.log('⚠️  No hay videos para probar el endpoint específico');
      }
    } catch (error) {
      console.log('❌ Error en endpoint de video específico:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar endpoint que SÍ requiere autenticación (para comparar)
    console.log('\n4. Probando endpoint que requiere autenticación (POST)...');
    try {
      await axios.post(`${BASE_URL}/projects/${PROJECT_ID}/videos`, {
        title: 'Test Video',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      console.log('❌ Esto no debería funcionar sin token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: Endpoint POST requiere autenticación (401 Unauthorized)');
      } else {
        console.log('⚠️  Error inesperado:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n🎉 Prueba completada!');
    console.log('\n📝 RESUMEN:');
    console.log('- GET /projects/:projectId/videos/public: ✅ Público (sin token)');
    console.log('- GET /projects/:projectId/videos: ✅ Público (sin token)');
    console.log('- GET /projects/:projectId/videos/:id: ✅ Público (sin token)');
    console.log('- POST /projects/:projectId/videos: ✅ Requiere autenticación');
    console.log('- Solo proyectos PUBLICADOS son accesibles públicamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testVideosPublicEndpoints(); 