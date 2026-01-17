import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { LoggerService } from '../common/logger.service';

import { AuthGuard } from '../common/guards/auth.guard';
import { UseGuards } from '@nestjs/common';


@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  private readonly logger = new LoggerService(EventsController.name);

  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createEventDto: CreateEventDto) {
    console.log(createEventDto, 'createEventDto');
    return this.eventsService.create(createEventDto);
  }


  @Get()
  findAll(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.findAll(queryDto);
  }

  @Get('categories')
  getCategories() {
    return this.eventsService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/similar')
  findSimilar(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.eventsService.findSimilar(id, limitNum);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
