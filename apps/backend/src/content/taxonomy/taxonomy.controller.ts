import { RouteNames } from '@common/route-names';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { TaxonomyService } from './taxonomy.service';
import { GenreResponseDto, TagResponseDto } from './dto/taxonomy-response.dto';

/** Customer-facing taxonomy reads (for filters/discovery). Cached. */
@ApiTags('Content · Taxonomy')
@Controller({ path: `${RouteNames.CONTENT}/taxonomy`, version: '1' })
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get('genres')
  @Public()
  @ApiOperation({ summary: 'Active genres (for filtering the feed)' })
  @ApiEnvelope(GenreResponseDto, { isArray: true })
  genres() {
    return this.taxonomy.listGenres(true);
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'All tags' })
  @ApiEnvelope(TagResponseDto, { isArray: true })
  tags() {
    return this.taxonomy.listTags();
  }
}
