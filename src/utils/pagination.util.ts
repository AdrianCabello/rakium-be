import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

export function getPaginationParams(paginationDto: PaginationDto) {
  const page = paginationDto.page || 1;
  const limit = paginationDto.limit || 10;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

export function buildSearchFilter(search?: string) {
  if (!search) return {};

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
      {
        longDescription: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
    ],
  };
}

export function buildUserSearchFilter(search?: string) {
  if (!search) return {};

  return {
    OR: [
      {
        email: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
    ],
  };
}

export function buildClientSearchFilter(search?: string) {
  if (!search) return {};

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
      {
        email: {
          contains: search,
          mode: 'insensitive' as const,
        },
      },
    ],
  };
} 