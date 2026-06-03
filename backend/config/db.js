const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
      if (retries < MAX_RETRIES) {
        console.log(`⏳ Retrying in 5 seconds…`);
        setTimeout(tryConnect, 5000);
      } else {
        console.error('💥 Could not connect to MongoDB after max retries. Auth routes will fail until DB is available.');
        console.error('   → Run MongoDB locally, or set MONGO_URI to your Atlas connection string in backend/.env');
      }
    }
  };

  await tryConnect();
};

module.exports = connectDB;
