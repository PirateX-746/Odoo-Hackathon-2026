import 'dotenv/config';
import { v5 as uuidv5 } from 'uuid';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Fixed namespace so every seed id is deterministic across re-runs (enables upsert-by-id idempotency).
const NAMESPACE = 'b0a6a7c0-2f1a-4a4a-9c1e-3a6b5c0f1a10';
const id = (slug: string) => uuidv5(slug, NAMESPACE);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — cannot seed the database.');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PASSWORD = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ─── Users ────────────────────────────────────────────────────────────
  const [admin, fleetManager, safetyOfficer, financialAnalyst, driverUser] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@transitops.dev' },
        update: {},
        create: {
          id: id('user:admin'),
          email: 'admin@transitops.dev',
          passwordHash,
          name: 'Ava Administrator',
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'fleet.manager@transitops.dev' },
        update: {},
        create: {
          id: id('user:fleet-manager'),
          email: 'fleet.manager@transitops.dev',
          passwordHash,
          name: 'Frank Fleetwood',
          role: 'FLEET_MANAGER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'safety.officer@transitops.dev' },
        update: {},
        create: {
          id: id('user:safety-officer'),
          email: 'safety.officer@transitops.dev',
          passwordHash,
          name: 'Sofia Sentinel',
          role: 'SAFETY_OFFICER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'finance.analyst@transitops.dev' },
        update: {},
        create: {
          id: id('user:financial-analyst'),
          email: 'finance.analyst@transitops.dev',
          passwordHash,
          name: 'Felix Numbers',
          role: 'FINANCIAL_ANALYST',
        },
      }),
      prisma.user.upsert({
        where: { email: 'driver.demo@transitops.dev' },
        update: {},
        create: {
          id: id('user:driver-demo'),
          email: 'driver.demo@transitops.dev',
          passwordHash,
          name: 'Alex Carter',
          role: 'DRIVER',
        },
      }),
    ]);

  // ─── Vehicles ─────────────────────────────────────────────────────────
  const vehicleDefs = [
    {
      slug: 'vehicle:van-05',
      registrationNumber: 'MH12AB1234',
      name: 'Van-05',
      type: 'Van',
      maxLoadCapacityKg: 500,
      odometerKm: 15155,
      acquisitionCost: 850000,
      status: 'AVAILABLE' as const,
      region: 'North',
    },
    {
      slug: 'vehicle:truck-11',
      registrationNumber: 'MH12CD5678',
      name: 'Truck-11',
      type: 'Truck',
      maxLoadCapacityKg: 5000,
      odometerKm: 82011,
      acquisitionCost: 2200000,
      status: 'AVAILABLE' as const,
      region: 'South',
    },
    {
      slug: 'vehicle:bus-02',
      registrationNumber: 'MH12EF9012',
      name: 'Bus-02',
      type: 'Bus',
      maxLoadCapacityKg: 3000,
      odometerKm: 45210,
      acquisitionCost: 1800000,
      status: 'ON_TRIP' as const,
      region: 'East',
    },
    {
      slug: 'vehicle:van-09',
      registrationNumber: 'MH12GH3456',
      name: 'Van-09',
      type: 'Van',
      maxLoadCapacityKg: 600,
      odometerKm: 30250,
      acquisitionCost: 900000,
      status: 'IN_SHOP' as const,
      region: 'North',
    },
    {
      slug: 'vehicle:truck-03',
      registrationNumber: 'MH12IJ7890',
      name: 'Truck-03',
      type: 'Truck',
      maxLoadCapacityKg: 4500,
      odometerKm: 120400,
      acquisitionCost: 2100000,
      status: 'RETIRED' as const,
      region: 'West',
    },
    {
      slug: 'vehicle:van-14',
      registrationNumber: 'MH12KL2345',
      name: 'Van-14',
      type: 'Van',
      maxLoadCapacityKg: 550,
      odometerKm: 5230,
      acquisitionCost: 870000,
      status: 'AVAILABLE' as const,
      region: 'South',
    },
  ];

  const vehicles: Record<string, Awaited<ReturnType<typeof prisma.vehicle.upsert>>> = {};
  for (const v of vehicleDefs) {
    const { slug, ...data } = v;
    vehicles[slug] = await prisma.vehicle.upsert({
      where: { registrationNumber: data.registrationNumber },
      update: {},
      create: { id: id(slug), ...data },
    });
  }

  // ─── Drivers ──────────────────────────────────────────────────────────
  const now = dayjs();
  const driverDefs = [
    {
      slug: 'driver:alex-carter',
      name: 'Alex Carter',
      licenseNumber: 'DL-AX-0001',
      licenseCategory: 'LMV',
      licenseExpiryDate: now.add(2, 'year').toDate(),
      contactNumber: '+1-555-0101',
      safetyScore: 95,
      status: 'AVAILABLE' as const,
      userId: driverUser.id,
    },
    {
      slug: 'driver:priya-sharma',
      name: 'Priya Sharma',
      licenseNumber: 'DL-PS-0002',
      licenseCategory: 'HMV',
      licenseExpiryDate: now.add(1, 'year').toDate(),
      contactNumber: '+1-555-0102',
      safetyScore: 88,
      status: 'AVAILABLE' as const,
      userId: null,
    },
    {
      slug: 'driver:john-mensah',
      name: 'John Mensah',
      licenseNumber: 'DL-JM-0003',
      licenseCategory: 'HMV',
      licenseExpiryDate: now.add(3, 'year').toDate(),
      contactNumber: '+1-555-0103',
      safetyScore: 91,
      status: 'ON_TRIP' as const,
      userId: null,
    },
    {
      slug: 'driver:wei-zhang',
      name: 'Wei Zhang',
      licenseNumber: 'DL-WZ-0004',
      licenseCategory: 'LMV',
      licenseExpiryDate: now.add(6, 'month').toDate(),
      contactNumber: '+1-555-0104',
      safetyScore: 72,
      status: 'SUSPENDED' as const,
      userId: null,
    },
    {
      slug: 'driver:fatima-noor',
      name: 'Fatima Noor',
      licenseNumber: 'DL-FN-0005',
      licenseCategory: 'LMV',
      licenseExpiryDate: now.subtract(30, 'day').toDate(),
      contactNumber: '+1-555-0105',
      safetyScore: 80,
      status: 'AVAILABLE' as const,
      userId: null,
    },
    {
      slug: 'driver:carlos-ibanez',
      name: 'Carlos Ibanez',
      licenseNumber: 'DL-CI-0006',
      licenseCategory: 'HMV',
      licenseExpiryDate: now.add(2, 'year').toDate(),
      contactNumber: '+1-555-0106',
      safetyScore: 99,
      status: 'OFF_DUTY' as const,
      userId: null,
    },
  ];

  const drivers: Record<string, Awaited<ReturnType<typeof prisma.driver.upsert>>> = {};
  for (const d of driverDefs) {
    const { slug, ...data } = d;
    drivers[slug] = await prisma.driver.upsert({
      where: { licenseNumber: data.licenseNumber },
      update: {},
      create: { id: id(slug), ...data },
    });
  }

  // ─── Trips ────────────────────────────────────────────────────────────
  const completedTrip = await prisma.trip.upsert({
    where: { id: id('trip:completed-1') },
    update: {},
    create: {
      id: id('trip:completed-1'),
      source: 'Pune',
      destination: 'Mumbai',
      vehicleId: vehicles['vehicle:van-05'].id,
      driverId: drivers['driver:priya-sharma'].id,
      cargoWeightKg: 420,
      plannedDistanceKm: 150,
      actualDistanceKm: 155,
      startOdometerKm: 15000,
      endOdometerKm: 15155,
      fuelConsumedLiters: 18.5,
      revenue: 12000,
      status: 'COMPLETED',
      dispatchedAt: now.subtract(3, 'day').toDate(),
      completedAt: now.subtract(2, 'day').toDate(),
      createdById: admin.id,
    },
  });

  const dispatchedTrip = await prisma.trip.upsert({
    where: { id: id('trip:dispatched-1') },
    update: {},
    create: {
      id: id('trip:dispatched-1'),
      source: 'Delhi',
      destination: 'Jaipur',
      vehicleId: vehicles['vehicle:bus-02'].id,
      driverId: drivers['driver:john-mensah'].id,
      cargoWeightKg: 2500,
      plannedDistanceKm: 280,
      startOdometerKm: 45210,
      status: 'DISPATCHED',
      dispatchedAt: now.subtract(1, 'day').toDate(),
      createdById: fleetManager.id,
    },
  });

  await prisma.trip.upsert({
    where: { id: id('trip:cancelled-1') },
    update: {},
    create: {
      id: id('trip:cancelled-1'),
      source: 'Nagpur',
      destination: 'Nashik',
      vehicleId: vehicles['vehicle:van-14'].id,
      driverId: drivers['driver:fatima-noor'].id,
      cargoWeightKg: 300,
      plannedDistanceKm: 200,
      status: 'CANCELLED',
      cancelledAt: now.subtract(5, 'day').toDate(),
      createdById: fleetManager.id,
    },
  });

  await prisma.trip.upsert({
    where: { id: id('trip:draft-1') },
    update: {},
    create: {
      id: id('trip:draft-1'),
      source: 'Chennai',
      destination: 'Bengaluru',
      vehicleId: vehicles['vehicle:truck-11'].id,
      driverId: drivers['driver:priya-sharma'].id,
      cargoWeightKg: 3200,
      plannedDistanceKm: 350,
      status: 'DRAFT',
      createdById: fleetManager.id,
    },
  });

  // ─── Maintenance logs ─────────────────────────────────────────────────
  await prisma.maintenanceLog.upsert({
    where: { id: id('maintenance:van-09-oil-change') },
    update: {},
    create: {
      id: id('maintenance:van-09-oil-change'),
      vehicleId: vehicles['vehicle:van-09'].id,
      type: 'Oil Change',
      description: 'Routine oil and filter change',
      cost: 4500,
      status: 'ACTIVE',
      openedAt: now.subtract(1, 'day').toDate(),
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { id: id('maintenance:van-05-brake-inspection') },
    update: {},
    create: {
      id: id('maintenance:van-05-brake-inspection'),
      vehicleId: vehicles['vehicle:van-05'].id,
      type: 'Brake Inspection',
      description: 'Scheduled brake pad inspection',
      cost: 3200,
      status: 'CLOSED',
      openedAt: now.subtract(20, 'day').toDate(),
      closedAt: now.subtract(18, 'day').toDate(),
    },
  });

  // ─── Fuel logs ────────────────────────────────────────────────────────
  await prisma.fuelLog.upsert({
    where: { id: id('fuel:van-05-trip-completed-1') },
    update: {},
    create: {
      id: id('fuel:van-05-trip-completed-1'),
      vehicleId: vehicles['vehicle:van-05'].id,
      tripId: completedTrip.id,
      liters: 18.5,
      cost: 1850,
      date: now.subtract(2, 'day').toDate(),
    },
  });

  await prisma.fuelLog.upsert({
    where: { id: id('fuel:bus-02-fillup-1') },
    update: {},
    create: {
      id: id('fuel:bus-02-fillup-1'),
      vehicleId: vehicles['vehicle:bus-02'].id,
      tripId: dispatchedTrip.id,
      liters: 220,
      cost: 19800,
      date: now.subtract(1, 'day').toDate(),
    },
  });

  await prisma.fuelLog.upsert({
    where: { id: id('fuel:truck-03-historical') },
    update: {},
    create: {
      id: id('fuel:truck-03-historical'),
      vehicleId: vehicles['vehicle:truck-03'].id,
      liters: 150,
      cost: 13500,
      date: now.subtract(60, 'day').toDate(),
    },
  });

  // ─── Expenses ─────────────────────────────────────────────────────────
  await prisma.expense.upsert({
    where: { id: id('expense:van-05-toll-1') },
    update: {},
    create: {
      id: id('expense:van-05-toll-1'),
      vehicleId: vehicles['vehicle:van-05'].id,
      type: 'TOLL',
      amount: 350,
      date: now.subtract(2, 'day').toDate(),
      description: 'Pune-Mumbai expressway toll',
    },
  });

  await prisma.expense.upsert({
    where: { id: id('expense:van-09-maintenance-1') },
    update: {},
    create: {
      id: id('expense:van-09-maintenance-1'),
      vehicleId: vehicles['vehicle:van-09'].id,
      type: 'MAINTENANCE',
      amount: 4500,
      date: now.subtract(1, 'day').toDate(),
      description: 'Oil change service charge',
    },
  });

  await prisma.expense.upsert({
    where: { id: id('expense:bus-02-other-1') },
    update: {},
    create: {
      id: id('expense:bus-02-other-1'),
      vehicleId: vehicles['vehicle:bus-02'].id,
      type: 'OTHER',
      amount: 1200,
      date: now.subtract(1, 'day').toDate(),
      description: 'Parking & permit fees',
    },
  });

  console.log('Seed complete.');
  console.log(`All seeded users share the password: ${PASSWORD}`);
  console.log(
    [admin, fleetManager, safetyOfficer, financialAnalyst, driverUser]
      .map((u) => `  ${u.role.padEnd(18)} ${u.email}`)
      .join('\n'),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
