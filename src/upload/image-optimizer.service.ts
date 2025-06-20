import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality?: number; // 1-100
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

@Injectable()
export class ImageOptimizerService {
  /**
   * Optimiza una imagen usando Sharp
   */
  async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
    const {
      quality = 80,
      width,
      height,
      format = 'jpeg',
      fit = 'inside'
    } = options;

    let sharpInstance = sharp(buffer);

    // Redimensionar si se especifica width o height
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit,
        withoutEnlargement: true, // No agrandar si la imagen es más pequeña
      });
    }

    // Aplicar optimización según el formato
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'avif':
        sharpInstance = sharpInstance.avif({ quality });
        break;
    }

    const optimizedBuffer = await sharpInstance.toBuffer();
    const mimeType = this.getMimeType(format);

    return {
      buffer: optimizedBuffer,
      mimeType,
      size: optimizedBuffer.length
    };
  }

  /**
   * Crea múltiples versiones de una imagen (thumbnail, medium, large)
   */
  async createImageVariants(
    buffer: Buffer,
    variants: { name: string; width?: number; height?: number; quality?: number; format?: 'jpeg' | 'png' | 'webp' }[]
  ): Promise<{ [key: string]: { buffer: Buffer; mimeType: string; size: number } }> {
    const results: { [key: string]: { buffer: Buffer; mimeType: string; size: number } } = {};

    for (const variant of variants) {
      const result = await this.optimizeImage(buffer, {
        width: variant.width,
        height: variant.height,
        quality: variant.quality || 80,
        format: variant.format || 'jpeg'
      });

      results[variant.name] = result;
    }

    return results;
  }

  /**
   * Optimiza automáticamente según el tipo de uso
   */
  async autoOptimize(
    buffer: Buffer,
    useCase: 'gallery' | 'thumbnail' | 'hero' | 'avatar' = 'gallery'
  ): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
    const presets = {
      gallery: { width: 1200, height: 800, quality: 85, format: 'webp' as const },
      thumbnail: { width: 300, height: 200, quality: 80, format: 'jpeg' as const },
      hero: { width: 1920, height: 1080, quality: 90, format: 'webp' as const },
      avatar: { width: 150, height: 150, quality: 85, format: 'jpeg' as const }
    };

    return this.optimizeImage(buffer, presets[useCase]);
  }

  /**
   * Obtiene información de la imagen sin procesarla
   */
  async getImageInfo(buffer: Buffer): Promise<sharp.Metadata> {
    return sharp(buffer).metadata();
  }

  /**
   * Convierte el formato a MIME type
   */
  private getMimeType(format: string): string {
    const mimeTypes = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif'
    };
    return mimeTypes[format] || 'image/jpeg';
  }

  /**
   * Verifica si la imagen necesita optimización
   */
  async needsOptimization(buffer: Buffer, maxSize: number = 1024 * 1024): Promise<boolean> {
    const metadata = await this.getImageInfo(buffer);
    const currentSize = buffer.length;

    // Optimizar si el archivo es muy grande o las dimensiones son excesivas
    return currentSize > maxSize || 
           (metadata.width && metadata.width > 2000) || 
           (metadata.height && metadata.height > 2000);
  }
} 