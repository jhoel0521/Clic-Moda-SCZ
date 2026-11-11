import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  ChangeFocalPointCommand,
  MediaIdQuery,
  UploadMediaCommand,
} from '../../application/dtos/media.dtos.js';
import { ChangeFocalPointUseCase } from '../../application/use-cases/change-focal-point.use-case.js';
import { DeleteMediaUseCase } from '../../application/use-cases/delete-media.use-case.js';
import { GetMediaMasterUseCase } from '../../application/use-cases/get-media-master.use-case.js';
import { ListMediaUseCase } from '../../application/use-cases/list-media.use-case.js';
import { UploadMediaUseCase } from '../../application/use-cases/upload-media.use-case.js';
import { UnsupportedImageError } from '../../domain/errors/media.errors.js';
import { MEDIA_LIMITS } from '../../domain/media-limits.js';
import {
  type FramingRequestDto,
  type MediaResponseDto,
  type UploadFieldsDto,
  framingRequestSchema,
  toMediaResponse,
  uploadFieldsSchema,
} from './media.dto.js';

// Lo único que se usa del archivo que entrega multer.
interface UploadedBytes {
  buffer: Buffer;
}

// Administración de imágenes: solo el Gerente. La copia maestra solo se entrega por aquí.
@Roles('GERENTE')
@Controller('media')
export class MediaAdminController {
  constructor(
    private readonly uploadMedia: UploadMediaUseCase,
    private readonly changeFocalPoint: ChangeFocalPointUseCase,
    private readonly deleteMedia: DeleteMediaUseCase,
    private readonly listMedia: ListMediaUseCase,
    private readonly getMaster: GetMediaMasterUseCase
  ) {}

  @Get()
  async list(): Promise<MediaResponseDto[]> {
    return (await this.listMedia.execute()).map(toMediaResponse);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MEDIA_LIMITS.maxBytes } }))
  async upload(
    @UploadedFile() file: UploadedBytes | undefined,
    @Body({ schema: uploadFieldsSchema }) fields: UploadFieldsDto
  ): Promise<MediaResponseDto> {
    if (!file) throw new UnsupportedImageError();
    const { alt, fit, background, focalX, focalY } = fields;
    const command = new UploadMediaCommand(file.buffer, alt, fit, background, focalX, focalY);
    return toMediaResponse(await this.uploadMedia.execute(command));
  }

  @Patch(':id/framing')
  async reframe(
    @Param('id') id: string,
    @Body({ schema: framingRequestSchema }) body: FramingRequestDto
  ): Promise<MediaResponseDto> {
    const command = new ChangeFocalPointCommand(
      id,
      body.focalX,
      body.focalY,
      body.fit,
      body.background
    );
    return toMediaResponse(await this.changeFocalPoint.execute(command));
  }

  @Get(':id/master')
  async master(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const { body, contentType } = await this.getMaster.execute(new MediaIdQuery(id));
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteMedia.execute(new MediaIdQuery(id));
  }
}
