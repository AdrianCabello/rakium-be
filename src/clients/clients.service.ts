import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('El email ya está registrado');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Recurso no encontrado');
      }
      if (error.code === 'P1001') {
        throw new InternalServerErrorException('Error de conexión con la base de datos');
      }
    }
    throw error;
  }

  async create(createClientDto: CreateClientDto) {
    try {
      // Verificar si el email ya existe
      const existingClient = await this.prisma.client.findUnique({
        where: { email: createClientDto.email },
      });

      if (existingClient) {
        throw new ConflictException('El email ya está registrado');
      }

      return this.prisma.client.create({
        data: createClientDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      return this.prisma.client.findMany({
        include: {
          projects: true,
          users: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
        include: {
          projects: true,
          users: true,
        },
      });

      if (!client) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      return client;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateClientDto: Partial<CreateClientDto>) {
    try {
      // Verificar si el cliente existe
      await this.findOne(id);

      // Si se está actualizando el email, verificar que no exista
      if (updateClientDto.email) {
        const existingClient = await this.prisma.client.findFirst({
          where: {
            email: updateClientDto.email,
            id: { not: id },
          },
        });

        if (existingClient) {
          throw new ConflictException('El email ya está registrado');
        }
      }

      return this.prisma.client.update({
        where: { id },
        data: updateClientDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      // Verificar si el cliente existe
      await this.findOne(id);

      return this.prisma.client.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
} 