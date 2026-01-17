import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto, SortBy, SortOrder } from './dto/query-events.dto';
import { Prisma } from '@prisma/client';
import { IEvent, IPaginatedResponse, IDeleteResponse } from '../types/events';

@Injectable()
export class EventsService {

  constructor(private prisma: PrismaService) { }


  async create(createEventDto: CreateEventDto): Promise<IEvent> {
    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        date: new Date(createEventDto.date),
        location: createEventDto.location,
        category: createEventDto.category,
        latitude: createEventDto.latitude,
        longitude: createEventDto.longitude,
      },
    });

    return this.transformEvent(event);
  }

  async findAll(queryDto: QueryEventsDto): Promise<IPaginatedResponse<IEvent>> {
    const { search, category, sortBy, sortOrder, page = 1, limit = 12 } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    if (sortBy === SortBy.DATE) {
      orderBy.date = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    } else if (sortBy === SortBy.TITLE) {
      orderBy.title = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    } else if (sortBy === SortBy.CREATED_AT) {
      orderBy.createdAt = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    }

    const total = await this.prisma.event.count({ where });

    const events = await this.prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: events.map((event) => this.transformEvent(event)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<IEvent> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this.transformEvent(event);
  }

  async findSimilar(id: string, limit: number = 4): Promise<IEvent[]> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const locationParts = event.location.split(',').map(p => p.trim());
    const primaryLocation = locationParts[0];

    const similarEvents = await this.prisma.event.findMany({
      where: {
        id: { not: id },
        OR: [
          { category: event.category },
          { location: { contains: primaryLocation, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { category: 'desc' },
        { location: 'asc' },
        { date: event.date < new Date() ? 'desc' : 'asc' },
      ],
      take: limit * 2,
    });

    const sortedEvents = similarEvents
      .map(e => {
        let score = 0;
        if (e.category === event.category) score += 10;
        if (e.location.toLowerCase().includes(primaryLocation.toLowerCase())) score += 5;

        const timeDiff = Math.abs(e.date.getTime() - event.date.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        score += Math.max(0, 5 - (daysDiff / 30));

        return { event: e, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.event);

    if (sortedEvents.length < limit) {
      const existingIds = sortedEvents.map(e => e.id);
      const additional = await this.prisma.event.findMany({
        where: {
          id: { notIn: [id, ...existingIds] },
        },
        orderBy: { date: 'asc' },
        take: limit - sortedEvents.length,
      });
      sortedEvents.push(...additional);
    }

    return sortedEvents.map((event) => this.transformEvent(event));
  }

  async getCategories(): Promise<string[]> {
    const events = await this.prisma.event.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return events.map((event) => event.category).sort();
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<IEvent> {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updateData: any = {};
    if (updateEventDto.title !== undefined) updateData.title = updateEventDto.title;
    if (updateEventDto.description !== undefined) updateData.description = updateEventDto.description;
    if (updateEventDto.date !== undefined) updateData.date = new Date(updateEventDto.date);
    if (updateEventDto.location !== undefined) updateData.location = updateEventDto.location;
    if (updateEventDto.category !== undefined) updateData.category = updateEventDto.category;
    if (updateEventDto.latitude !== undefined) updateData.latitude = updateEventDto.latitude;
    if (updateEventDto.longitude !== undefined) updateData.longitude = updateEventDto.longitude;

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateData,
    });

    return this.transformEvent(updatedEvent);
  }

  async remove(id: string): Promise<IDeleteResponse> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { id };
  }

  private transformEvent(event: any): IEvent {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category,
      latitude: event.latitude,
      longitude: event.longitude,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}
