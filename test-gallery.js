require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGallery() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Verificar si hay proyectos
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, status: true }
    });
    console.log(`📋 Proyectos encontrados: ${projects.length}`);
    console.log('Proyectos:', projects);
    
    // Verificar si hay elementos en Gallery
    const galleryCount = await prisma.gallery.count();
    console.log(`📸 Total de elementos en Gallery: ${galleryCount}`);
    
    if (galleryCount > 0) {
      const galleryItems = await prisma.gallery.findMany({
        select: { id: true, url: true, projectId: true, title: true }
      });
      console.log('📋 Elementos de Gallery:', galleryItems);
    }
    
    // Si hay proyectos, probar con el primero
    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log(`\n🔍 Probando galería para proyecto: ${firstProject.name} (${firstProject.id})`);
      
      const projectGallery = await prisma.gallery.findMany({
        where: { projectId: firstProject.id },
        orderBy: { order: 'asc' }
      });
      
      console.log(`📸 Imágenes en galería para ${firstProject.name}: ${projectGallery.length}`);
      console.log('Galería:', projectGallery);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGallery(); 