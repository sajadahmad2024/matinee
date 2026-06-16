import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { TaxonomyService } from './taxonomy.service';
import {
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  CreateTagDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from './dto/taxonomy.dto';
import {
  GenreResponseDto,
  PersonResponseDto,
  StudioResponseDto,
  TagResponseDto,
} from './dto/taxonomy-response.dto';

/** Admin content-library management: studios / genres / tags / cast. */
@ApiTags('Admin · Content Library')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/content/taxonomy`, version: '1' })
export class AdminTaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  // Studios
  @Get('studios') @Permissions('content:read') @ApiOperation({ summary: 'List studios' }) @ApiEnvelope(StudioResponseDto, { isArray: true })
  studios() { return this.taxonomy.listStudios(); }
  @Post('studios') @Permissions('content:write') @ApiOperation({ summary: 'Create studio' }) @ApiEnvelope(StudioResponseDto, { status: 201 })
  createStudio(@Body() dto: CreateStudioDto) { return this.taxonomy.createStudio(dto); }
  @Patch('studios/:id') @Permissions('content:write') @ApiOperation({ summary: 'Update studio' }) @ApiEnvelope(StudioResponseDto)
  updateStudio(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudioDto) { return this.taxonomy.updateStudio(id, dto); }
  @Delete('studios/:id') @Permissions('content:write') @ApiOperation({ summary: 'Delete studio' }) @ApiEnvelope(MessageResponseDto)
  deleteStudio(@Param('id', ParseUUIDPipe) id: string) { return this.taxonomy.deleteStudio(id); }

  // Genres
  @Get('genres') @Permissions('content:read') @ApiOperation({ summary: 'List genres' }) @ApiEnvelope(GenreResponseDto, { isArray: true })
  genres() { return this.taxonomy.listGenres(false); }
  @Post('genres') @Permissions('content:write') @ApiOperation({ summary: 'Create genre' }) @ApiEnvelope(GenreResponseDto, { status: 201 })
  createGenre(@Body() dto: CreateGenreDto) { return this.taxonomy.createGenre(dto); }
  @Patch('genres/:id') @Permissions('content:write') @ApiOperation({ summary: 'Update genre (name/active/sort)' }) @ApiEnvelope(GenreResponseDto)
  updateGenre(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGenreDto) { return this.taxonomy.updateGenre(id, dto); }
  @Delete('genres/:id') @Permissions('content:write') @ApiOperation({ summary: 'Delete genre' }) @ApiEnvelope(MessageResponseDto)
  deleteGenre(@Param('id', ParseUUIDPipe) id: string) { return this.taxonomy.deleteGenre(id); }

  // Tags
  @Get('tags') @Permissions('content:read') @ApiOperation({ summary: 'List tags' }) @ApiEnvelope(TagResponseDto, { isArray: true })
  tags() { return this.taxonomy.listTags(); }
  @Post('tags') @Permissions('content:write') @ApiOperation({ summary: 'Create tag' }) @ApiEnvelope(TagResponseDto, { status: 201 })
  createTag(@Body() dto: CreateTagDto) { return this.taxonomy.createTag(dto.name); }
  @Patch('tags/:id') @Permissions('content:write') @ApiOperation({ summary: 'Rename a tag' }) @ApiEnvelope(TagResponseDto)
  updateTag(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateTagDto) { return this.taxonomy.updateTag(id, dto.name); }
  @Delete('tags/:id') @Permissions('content:write') @ApiOperation({ summary: 'Delete tag' }) @ApiEnvelope(MessageResponseDto)
  deleteTag(@Param('id', ParseUUIDPipe) id: string) { return this.taxonomy.deleteTag(id); }

  // People / cast
  @Get('people') @Permissions('content:read') @ApiOperation({ summary: 'List cast & crew' }) @ApiEnvelope(PersonResponseDto, { isArray: true })
  people() { return this.taxonomy.listPeople(); }
  @Post('people') @Permissions('content:write') @ApiOperation({ summary: 'Create person' }) @ApiEnvelope(PersonResponseDto, { status: 201 })
  createPerson(@Body() dto: CreatePersonDto) { return this.taxonomy.createPerson(dto); }
  @Patch('people/:id') @Permissions('content:write') @ApiOperation({ summary: 'Update person' }) @ApiEnvelope(PersonResponseDto)
  updatePerson(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePersonDto) { return this.taxonomy.updatePerson(id, dto); }
  @Delete('people/:id') @Permissions('content:write') @ApiOperation({ summary: 'Delete person' }) @ApiEnvelope(MessageResponseDto)
  deletePerson(@Param('id', ParseUUIDPipe) id: string) { return this.taxonomy.deletePerson(id); }
}
