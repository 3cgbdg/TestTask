import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto, SortBy, SortOrder } from './dto/query-events.dto';
import { Prisma } from '@prisma/client';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class EventsService {
  private readonly logger = new LoggerService(EventsService.name);

  constructor(private prisma: PrismaService) { }


  async create(createEventDto: CreateEventDto) {
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

  async findAll(queryDto: QueryEventsDto) {
    const { search, category, sortBy, sortOrder, page = 1, limit = 12 } = queryDto;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
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

    // Build orderBy clause
    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    if (sortBy === SortBy.DATE) {
      orderBy.date = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    } else if (sortBy === SortBy.TITLE) {
      orderBy.title = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    } else if (sortBy === SortBy.CREATED_AT) {
      orderBy.createdAt = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    }

    // Get total count for pagination
    const total = await this.prisma.event.count({ where });

    // Get events with pagination
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

  async findOne(id: string) {
    this.logger.debug(`Finding event with ID: ${id}`);

    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      this.logger.warn(`Event with ID ${id} not found`);
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    this.logger.debug(`Event found: ${event.title}`);
    return this.transformEvent(event);
  }

  async findSimilar(id: string, limit: number = 4) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Improved similarity algorithm with weighting:
    // 1. Same category (highest weight)
    // 2. Similar location (medium weight)
    // 3. Proximity in time (lower weight)

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
        // Prisma doesn't support complex weighting directly in findMany, 
        // so we sort by priority fields
        { category: 'desc' }, // Higher priority for same category
        { location: 'asc' },   // Secondary for location
        { date: event.date < new Date() ? 'desc' : 'asc' }, // Then by date proximity
      ],
      take: limit * 2, // Take more for manual refiner if needed, but here we just limit
    });

    // Simple manual sort for better weighting if results are plenty
    const sortedEvents = similarEvents
      .map(e => {
        let score = 0;
        if (e.category === event.category) score += 10;
        if (e.location.toLowerCase().includes(primaryLocation.toLowerCase())) score += 5;

        // Date score: closer dates get higher score (max 5 points)
        const timeDiff = Math.abs(e.date.getTime() - event.date.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        score += Math.max(0, 5 - (daysDiff / 30)); // 5 points if same day, 0 if > 5 months away

        return { event: e, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.event);

    // Fallback: if not enough events, fill with upcoming events
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

  async update(id: string, updateEventDto: UpdateEventDto) {
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

  async remove(id: string) {
    this.logger.log(`Deleting event with ID: ${id}`);

    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      this.logger.warn(`Event with ID ${id} not found for deletion`);
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    await this.prisma.event.delete({
      where: { id },
    });

    this.logger.log(`Event deleted successfully: ${event.title}`);

    return { id };
  }

  private transformEvent(event: any) {
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
