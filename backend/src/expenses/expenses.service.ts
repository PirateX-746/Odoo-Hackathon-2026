import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Expense, Prisma } from '@/generated/prisma/client';
import { serializeDecimals } from '@/common/utils/decimal.util';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    await this.assertVehicleExists(dto.vehicleId);

    const expense = await this.prisma.expense.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type,
        amount: dto.amount,
        date: dto.date,
        description: dto.description,
      },
    });
    return serializeDecimals(expense);
  }

  async findAll(query: QueryExpenseDto): Promise<PaginatedResult<Expense>> {
    const where: Prisma.ExpenseWhereInput = {
      ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const { skip, take } = paginationSkipTake(query);
    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return buildPaginatedResult(
      expenses.map((expense) => serializeDecimals(expense)),
      total,
      query,
    );
  }

  async findByVehicle(vehicleId: string): Promise<Expense[]> {
    await this.assertVehicleExists(vehicleId);
    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' },
    });
    return expenses.map((expense) => serializeDecimals(expense));
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found.');
    }
    return serializeDecimals(expense);
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    await this.findOne(id);
    if (dto.vehicleId) {
      await this.assertVehicleExists(dto.vehicleId);
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.vehicleId !== undefined ? { vehicleId: dto.vehicleId } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.date !== undefined ? { date: dto.date } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      },
    });
    return serializeDecimals(expense);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }
  }
}
