import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas API (coincide con healthcheckPath en Railway)
  app.setGlobalPrefix('api');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Rakium API')
    .setDescription('API for managing Rakium web projects')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS: permitir frontends en producción y desarrollo
  const allowedOrigins = [
    'https://rakium.dev',
    'https://www.rakium.dev',
    'https://lautarovulcano.com',
    'https://www.lautarovulcano.com',
    'https://landicandela.com',
    'https://www.landicandela.com',
    'https://kamak.com.ar',
    'https://www.kamak.com.ar',
    'https://adriancabello.github.io',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://127.0.0.1:4200',
  ];
  const extraOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];
  const origins = [...new Set([...allowedOrigins, ...extraOrigins])];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin Origin (ej. Postman, servidor a servidor) y orígenes whitelisteados
      if (!origin || origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  // Agregar filtro de excepciones de Prisma
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
