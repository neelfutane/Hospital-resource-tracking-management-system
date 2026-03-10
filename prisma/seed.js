const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create users
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        email: 'admin@hospital.com',
        firstName: 'Admin',
        lastName: 'User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        department: 'GENERAL',
        isActive: true,
      },
    });

    const doctorUser = await prisma.user.upsert({
      where: { email: 'doctor@hospital.com' },
      update: {},
      create: {
        email: 'doctor@hospital.com',
        firstName: 'Doctor',
        lastName: 'Smith',
        password: await bcrypt.hash('doctor123', 10),
        role: 'DOCTOR',
        department: 'ICU',
        isActive: true,
      },
    });

    const nurseUser = await prisma.user.upsert({
      where: { email: 'nurse@hospital.com' },
      update: {},
      create: {
        email: 'nurse@hospital.com',
        firstName: 'Nurse',
        lastName: 'Johnson',
        password: await bcrypt.hash('nurse123', 10),
        role: 'NURSE',
        department: 'ICU',
        isActive: true,
      },
    });

    // Create beds
    for (let i = 1; i <= 50; i++) {
      const department = i <= 10 ? 'ICU' : i <= 30 ? 'GENERAL' : 'ER';
      const status = i % 4 === 0 ? 'OCCUPIED' : i % 7 === 0 ? 'MAINTENANCE' : 'AVAILABLE';
      const bedNumber = `BED-${i.toString().padStart(3, '0')}`;
      
      // Check if bed exists first
      const existingBed = await prisma.bed.findFirst({
        where: { bedNumber }
      });
      
      if (!existingBed) {
        await prisma.bed.create({
          data: {
            bedNumber,
            department,
            status,
            floor: i <= 10 ? 1 : i <= 30 ? 2 : 3,
            patientName: status === 'OCCUPIED' ? `Patient ${i}` : null,
            patientId: status === 'OCCUPIED' ? `P${i}` : null,
          },
        });
      }
    }

    // Create rooms
    for (let i = 1; i <= 20; i++) {
      const department = i <= 5 ? 'ICU' : i <= 12 ? 'GENERAL' : 'ER';
      const status = i % 3 === 0 ? 'OCCUPIED' : 'AVAILABLE';
      const roomNumber = `ROOM-${i.toString().padStart(3, '0')}`;
      
      // Check if room exists first
      const existingRoom = await prisma.room.findFirst({
        where: { roomNumber }
      });
      
      if (!existingRoom) {
        await prisma.room.create({
          data: {
            roomNumber,
            department,
            type: department === 'ICU' ? 'ICU' : 'General Ward',
            capacity: department === 'ICU' ? 2 : 4,
            currentOccupancy: status === 'OCCUPIED' ? 1 : 0,
            status,
            floor: i <= 5 ? 1 : i <= 12 ? 2 : 3,
          },
        });
      }
    }

    // Create equipment
    const equipmentTypes = [
      'Ventilator', 'Defibrillator', 'Patient Monitor', 'Infusion Pump',
      'Suction Machine', 'Oxygen Cylinder', 'X-Ray Machine', 'Ultrasound Machine'
    ];

    for (let i = 1; i <= 40; i++) {
      const type = equipmentTypes[i % equipmentTypes.length];
      const department = i <= 10 ? 'ICU' : i <= 25 ? 'GENERAL' : 'ER';
      const status = i % 6 === 0 ? 'MAINTENANCE' : 'AVAILABLE';
      const name = `${type} ${i}`;
      
      // Check if equipment exists first
      const existingEquipment = await prisma.equipment.findFirst({
        where: { name }
      });
      
      if (!existingEquipment) {
        await prisma.equipment.create({
          data: {
            name,
            type,
            model: `${type}-MODEL-${i}`,
            serialNumber: `SN-${i.toString().padStart(6, '0')}`,
            department,
            location: department,
            status,
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          },
        });
      }
    }

    console.log('✅ Database seeded successfully');
    console.log('📊 Created sample data:');
    console.log(`   - Users: 3 (admin, doctor, nurse)`);
    console.log(`   - Beds: 50`);
    console.log(`   - Rooms: 20`);
    console.log(`   - Equipment: 40`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
