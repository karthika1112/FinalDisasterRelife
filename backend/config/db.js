const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not defined in environment variables');
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
    if (err.name === 'MongoServerSelectionError') {
      console.error('❌  Atlas IP not whitelisted or cluster unreachable.');
      console.error('    → Security → Network Access → Add 0.0.0.0/0');
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication')) {
      console.error('❌  MongoDB authentication failed — check MONGO_URI credentials');
    } else {
      console.error(`❌  MongoDB error: ${err.message}`);
    }
    console.log('🔄  Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️   MongoDB disconnected'));
mongoose.connection.on('reconnected',  () => console.log('✅  MongoDB reconnected'));

// Railway sends SIGTERM (not SIGINT) to stop containers
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('🛑  MongoDB closed (SIGTERM)');
  process.exit(0);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑  MongoDB closed (SIGINT)');
  process.exit(0);
});

module.exports = connectDB;
