import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'admin@rakium.com' },
            role: { type: 'string', example: 'ADMIN' },
            clientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Request() req) {
    console.log('👤 Auth Controller - getProfile called');
    console.log('👤 Auth Controller - User from request:', req.user);
    return req.user;
  }

  @Get('test-auth')
  @ApiOperation({ summary: 'Endpoint de prueba para verificar autenticación' })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  testAuth(@Request() req) {
    console.log('🧪 Auth Controller - testAuth called');
    console.log('🧪 Auth Controller - Headers:', req.headers);
    console.log('🧪 Auth Controller - User:', req.user);
    
    return {
      message: 'Autenticación exitosa',
      user: req.user,
      timestamp: new Date().toISOString()
    };
  }
} 