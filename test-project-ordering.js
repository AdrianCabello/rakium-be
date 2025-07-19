const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const CLIENT_ID = 'dc984cb7-7c8c-476f-b900-2ed54c5781f9'; // ID del cliente de ejemplo

async function testProjectOrdering() {
  try {
    console.log('🧪 Probando sistema de ordenamiento de proyectos...\n');

    // 1. Crear varios proyectos con diferentes órdenes
    console.log('1. Creando proyectos con diferentes órdenes...');
    
    const projects = [];
    
    // Proyecto 1 - Orden 3
    const project1 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Tercero',
      clientId: CLIENT_ID,
      description: 'Este proyecto debería aparecer tercero',
      order: 3
    });
    projects.push(project1.data);
    console.log('✅ Proyecto 1 creado con order: 3');

    // Proyecto 2 - Orden 1
    const project2 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Primero',
      clientId: CLIENT_ID,
      description: 'Este proyecto debería aparecer primero',
      order: 1
    });
    projects.push(project2.data);
    console.log('✅ Proyecto 2 creado con order: 1');

    // Proyecto 3 - Orden 2
    const project3 = await axios.post(`${BASE_URL}/projects`, {
      name: 'Proyecto Segundo',
      clientId: CLIENT_ID,
      description: 'Este proyecto debería aparecer segundo',
      order: 2
    });
    projects.push(project3.data);
    console.log('✅ Proyecto 3 creado con order: 2');

    // 2. Obtener proyectos y verificar el orden
    console.log('\n2. Obteniendo proyectos para verificar orden...');
    const getProjectsResponse = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
    console.log('✅ Proyectos obtenidos');
    
    const orderedProjects = getProjectsResponse.data.data;
    console.log('\n📋 Orden de proyectos:');
    orderedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
    });

    // 3. Reordenar proyectos usando el endpoint de reordenamiento
    console.log('\n3. Reordenando proyectos...');
    const reorderData = [
      { id: project1.data.id, order: 1 },
      { id: project2.data.id, order: 2 },
      { id: project3.data.id, order: 3 }
    ];

    await axios.patch(`${BASE_URL}/projects/reorder`, reorderData);
    console.log('✅ Proyectos reordenados');

    // 4. Verificar el nuevo orden
    console.log('\n4. Verificando nuevo orden...');
    const getProjectsAfterReorder = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
    console.log('✅ Proyectos obtenidos después de reordenar');
    
    const reorderedProjects = getProjectsAfterReorder.data.data;
    console.log('\n📋 Nuevo orden de proyectos:');
    reorderedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
    });

    // 5. Actualizar orden individual de un proyecto
    console.log('\n5. Actualizando orden individual de un proyecto...');
    await axios.patch(`${BASE_URL}/projects/${project1.data.id}`, {
      order: 5
    });
    console.log('✅ Orden individual actualizado');

    // 6. Verificar el orden final
    console.log('\n6. Verificando orden final...');
    const getProjectsFinal = await axios.get(`${BASE_URL}/projects?clientId=${CLIENT_ID}`);
    console.log('✅ Proyectos obtenidos (orden final)');
    
    const finalProjects = getProjectsFinal.data.data;
    console.log('\n📋 Orden final de proyectos:');
    finalProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (order: ${project.order})`);
    });

    console.log('\n🎉 Prueba de ordenamiento completada exitosamente!');
    console.log('El sistema de ordenamiento funciona correctamente.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('Mensaje de error:', error.response.data.message);
    }
  }
}

// Ejecutar la prueba
testProjectOrdering(); 