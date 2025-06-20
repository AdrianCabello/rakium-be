import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('videos')
@Controller('projects/:projectId/videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a YouTube video to project',
    description: 'Adds a YouTube video to the project with title, description and order. The YouTube URL is validated to ensure it is a valid YouTube link.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Video data to add',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Video title',
          example: 'Video promocional del proyecto',
        },
        description: {
          type: 'string',
          description: 'Video description (optional)',
          example: 'Video que muestra el proceso de construcción',
        },
        youtubeUrl: {
          type: 'string',
          description: 'YouTube video URL',
          example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        order: {
          type: 'number',
          description: 'Video order in project (optional)',
          example: 1,
        },
      },
      required: ['title', 'youtubeUrl'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid YouTube URL or missing required fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  create(@Param('projectId') projectId: string, @Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(projectId, createVideoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos from project with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated videos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  findAll(@Param('projectId') projectId: string, @Query() paginationDto: PaginationDto) {
    return this.videosService.findAll(projectId, paginationDto);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public videos from project with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated public videos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  findPublicVideos(@Param('projectId') projectId: string, @Query() paginationDto: PaginationDto) {
    return this.videosService.findPublicVideos(projectId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific video from project' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.videosService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a video from project' })
  @ApiResponse({ status: 200, description: 'Video updated successfully' })
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(projectId, id, updateVideoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video from project' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.videosService.remove(projectId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder videos in project' })
  @ApiResponse({ status: 200, description: 'Videos reordered successfully' })
  reorder(@Param('projectId') projectId: string, @Body() videoIds: string[]) {
    return this.videosService.reorder(projectId, videoIds);
  }
} 