import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto, UpdateTokenDto, GetTokensQueryDto } from './tokens.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new token' })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tokens with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns list of tokens' })
  findAll(@Query() query: GetTokensQueryDto) {
    return this.tokensService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a token by ID' })
  @ApiResponse({ status: 200, description: 'Returns the token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  findOne(@Param('id') id: string) {
    return this.tokensService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a token' })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(id, updateTokenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a token' })
  @ApiResponse({ status: 204, description: 'Token deleted successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  remove(@Param('id') id: string) {
    return this.tokensService.remove(id);
  }
}

