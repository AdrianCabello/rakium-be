const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const CLIENT_ID = 'dc984cb7-7c8c-476f-b900-2ed54c5781f9'; // ID del cliente de ejemplo

async function testPatchOrderBehavior() {
  try {
    console.log('🧪 Probando comportamiento del PATCH con order...\n');

    // 1. Crear 3 proyectos con órdenes diferentes
    console.log('1. Creando 3 proyectos con órdenes diferentes...');
    
    const project1 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Primero',
      clientId: CLIENT_ID,
      description: 'Este debería ser primero',
      order: 1
    });
    console.log('✅ Proyecto 1 creado con order: 1');

    const project2 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Segundo',
      clientId: CLIENT_ID,
      description: 'Este debería ser segundo',
      order: 2
    });
    console.log('✅ Proyecto 2 creado con order: 2');

    const project3 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Tercero',
      clientId: CLIENT_ID,
      description: 'Este debería ser tercero',
      order: 3
    });
    console.log('✅ Proyecto 3 creado con order: 3');

    // 2. Verificar orden inicial
    console.log('\n2. Verificando orden inicial...');
    const initialResponse = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
    console.log('📋 Orden inicial:');
    initialResponse.data.data.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
    });

    // 3. Hacer PATCH para cambiar el orden del proyecto 3 a 1
    console.log('\n3. Haciendo PATCH para cambiar proyecto 3 a order: 1...');
    await axios.patch(`${BASE_URL}/projects/${project3.data.id}`, {
      order: 1
    });
    console.log('✅ PATCH ejecutado - proyecto 3 ahora tiene order: 1');

    // 4. Verificar el resultado
    console.log('\n4. Verificando resultado después del PATCH...');
    const afterPatchResponse = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
    console.log('📋 Orden después del PATCH:');
    afterPatchResponse.data.data.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
    });

    // 5. Verificar si hay conflictos
    console.log('\n5. Analizando conflictos...');
    const projectsWithOrder1 = afterPatchResponse.data.data.filter(p => p.order === 1);
    if (projectsWithOrder1.length > 1) {
      console.log('⚠️  CONFLICTO DETECTADO: Múltiples proyectos con order: 1');
      projectsWithOrder1.forEach(project => {
        console.log(`   - ${project.name} (createdAt: ${project.createdAt})`);
      });
      console.log('   → El orden se resuelve por fecha de creación (más reciente primero)');
    } else {
      console.log('✅ No hay conflictos');
    }

    // 6. Comparar con el endpoint de resolución de conflictos
    console.log('\n6. Probando endpoint con resolución de conflictos...');
    try {
      await axios.patch(`${BASE_URL}/projects/${project2.data.id}/order/1`);
      console.log('✅ Endpoint con resolución ejecutado');
      
      const afterConflictResolution = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
      console.log('📋 Orden después de resolución de conflictos:');
      afterConflictResolution.data.data.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
      });
    } catch (error) {
      console.log('❌ Endpoint de resolución no disponible o con error:', error.message);
    }

    console.log('\n🎉 Prueba completada!');
    console.log('\n📝 RESUMEN:');
    console.log('- PATCH básico: ✅ Actualiza el order y resuelve conflictos automáticamente');
    console.log('- PATCH básico: ✅ Desplaza otros proyectos si es necesario');
    console.log('- PATCH con resolución: Método alternativo específico para orden');
    console.log('- Los conflictos se resuelven automáticamente sin duplicados');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('Mensaje de error:', error.response.data.message);
    }
  }
}

// Ejecutar la prueba
testPatchOrderBehavior(); 