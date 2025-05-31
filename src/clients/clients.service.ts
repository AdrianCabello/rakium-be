import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

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
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El email ya está registrado');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        projects: true,
        users: true,
      },
    });
  }

  async findOne(id: string) {
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
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El email ya está registrado');
        }
      }
      throw error;
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
} 