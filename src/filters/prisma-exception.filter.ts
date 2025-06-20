import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST; // Por defecto 400 para errores de Prisma
    let message = 'Error en los datos enviados';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          const field = exception.meta?.field_name as string;
          message = `No se puede crear el registro porque el ID referenciado no existe en la base de datos`;
          break;
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Ya existe un registro con los mismos datos únicos';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'No se encontró el registro solicitado';
          break;
        case 'P2021':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error en la base de datos';
          break;
        case 'P2022':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error en la estructura de la base de datos';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Error en la operación de base de datos';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Los datos enviados contienen campos inválidos o no permitidos';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception instanceof Prisma.PrismaClientKnownRequestError ? exception.code : 'VALIDATION_ERROR',
    });
  }
} 