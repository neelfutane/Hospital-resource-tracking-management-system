const User = require('../models/User.model');
const { hashPassword } = require('../utils/hashPassword');
const mongoose = require('mongoose');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const userData = [
      {
        name: 'Admin User',
        email: 'admin@hospital.com',
        passwordHash: await hashPassword('admin123'),
        role: 'admin',
        assignedWard: null
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'doctor@hospital.com',
        passwordHash: await hashPassword('doctor123'),
        role: 'doctor',
        assignedWard: 'General'
      },
      {
        name: 'Nurse Emily Davis',
        email: 'nurse@hospital.com',
        passwordHash: await hashPassword('nurse123'),
        role: 'nurse',
        assignedWard: 'ICU'
      },
      {
        name: 'Staff Michael Brown',
        email: 'staff@hospital.com',
        passwordHash: await hashPassword('staff123'),
        role: 'staff',
        assignedWard: 'Emergency'
      }
    ];

    await User.insertMany(userData);
    console.log(`Seeded ${userData.length} users successfully`);

    // Display user credentials for testing
    console.log('\n=== User Credentials for Testing ===');
    userData.forEach(user => {
      console.log(`\n${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.role}123`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Assigned Ward: ${user.assignedWard || 'None'}`);
    });
    console.log('\n=====================================\n');

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
