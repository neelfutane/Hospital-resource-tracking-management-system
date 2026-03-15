require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const seedUsers = require('./seedUsers');
const seedBeds = require('./seedBeds');
const seedEquipment = require('./seedEquipment');
const seedRooms = require('./seedRooms');

const runSeeds = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Run seeds in order
    console.log('📋 Seeding users...');
    await seedUsers();
    console.log('✅ Users seeded\n');

    console.log('🛏️  Seeding beds...');
    await seedBeds();
    console.log('✅ Beds seeded\n');

    console.log('🏥 Seeding equipment...');
    await seedEquipment();
    console.log('✅ Equipment seeded\n');

    console.log('🚪 Seeding rooms...');
    await seedRooms();
    console.log('✅ Rooms seeded\n');

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding process
runSeeds();
