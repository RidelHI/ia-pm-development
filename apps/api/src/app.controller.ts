import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller({
  path: '',
  version: '1',
})
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API overview' })
  getInfo() {
    return this.appService.getInfo();
  }
}
