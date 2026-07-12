import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Driver, Prisma } from '@/generated/prisma/client';
import { DriverStatus } from '@/generated/prisma/enums';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto): Promise<Driver> {
    const existing = await this.prisma.driver.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existing) {
      throw new ConflictException(
        'A driver with this license number already exists.',
      );
    }
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        licenseCategory: dto.licenseCategory,
        licenseExpiryDate: new Date(dto.licenseExpiryDate),
        contactNumber: dto.contactNumber,
        safetyScore: dto.safetyScore ?? 100,
        status: dto.status ?? DriverStatus.AVAILABLE,
      },
    });
  }

  async findAll(query: QueryDriverDto): Promise<PaginatedResult<Driver>> {
    const where: Prisma.DriverWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take } = paginationSkipTake(query);
    const orderBy: Prisma.DriverOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({ where, skip, take, orderBy }),
      this.prisma.driver.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query);
  }

  findDispatchEligible(): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: {
        status: DriverStatus.AVAILABLE,
        licenseExpiryDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      throw new NotFoundException('Driver not found.');
    }
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto): Promise<Driver> {
    await this.findOne(id);
    const { licenseExpiryDate, ...rest } = dto;
    const data: Prisma.DriverUpdateInput = {
      ...rest,
      ...(licenseExpiryDate
        ? { licenseExpiryDate: new Date(licenseExpiryDate) }
        : {}),
    };
    return this.prisma.driver.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.driver.delete({ where: { id } });
  }
}
