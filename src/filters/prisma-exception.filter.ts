import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    switch (exception.code) {
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        const field = exception.meta?.field_name as string;
        message = `No se puede crear el registro porque el ID referenciado no existe en la base de datos`;
        break;
      // Puedes agregar más casos según necesites
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
} 