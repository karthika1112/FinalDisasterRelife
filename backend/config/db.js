const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦  Database        : ${conn.connection.name}`);
  } catch (err) {
    if (err.message.includes('IP') || err.message.includes('whitelist') || err.name === 'MongoServerSelectionError') {
      console.error('❌  Atlas IP not whitelisted.');
      console.error('    → Go to: https://cloud.mongodb.com');
      console.error('    → Security → Network Access → Add IP Address');
      console.error(`    → Add your IP or use 0.0.0.0/0 for development`);
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication')) {
      console.error('❌  MongoDB authentication failed.');
      console.error('    → Check username and password in MONGO_URI inside .env');
    } else {
      console.error(`❌  MongoDB error: ${err.message}`);
    }
    // Retry after 5 seconds instead of crashing
    console.log('🔄  Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connection events
mongoose.connection.on('disconnected', () => console.warn('⚠️   MongoDB disconnected — will auto-retry'));
mongoose.connection.on('reconnected',  () => console.log('✅  MongoDB reconnected'));

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑  MongoDB connection closed');
  process.exit(0);
});

module.exports = connectDB;
