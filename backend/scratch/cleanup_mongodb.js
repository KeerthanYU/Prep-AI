require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function cleanup() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Identify users with null firebaseId
    const nullUsers = await User.find({ firebaseId: null });
    console.log(`Found ${nullUsers.length} users with null firebaseId.`);

    // 2. Drop the existing index (it might be named 'firebaseId_1')
    try {
      console.log('Attempting to drop current unique index on firebaseId...');
      await User.collection.dropIndex('firebaseId_1');
      console.log('Successfully dropped firebaseId_1 index.');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('Index firebaseId_1 not found, skipping drop.');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }

    // 3. Clean up duplicate nulls if necessary 
    // (If you have 2 users with null, you can't create a sparse unique index if they are considered "duplicates" by some engines, though usually sparse handles this).
    // Actually, sparse only skips missing fields. In MongoDB, null is a value.
    // If multiple records have { firebaseId: null }, a UNIQUE index will still fail.
    // So we should remove the null value and make it undefined (missing).
    
    console.log('Converting firebaseId: null to undefined for all records...');
    const result = await User.updateMany(
      { firebaseId: null },
      { $unset: { firebaseId: "" } }
    );
    console.log(`Modified ${result.modifiedCount} documents.`);

    // 4. Mongoose will automatically recreate the index as sparse next time the app starts
    // but we can force it here:
    console.log('App starting will recreate the index properly.');
    
    console.log('Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
