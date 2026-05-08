import app from './src/app.js';
import dotenv from 'dotenv';
import prisma from './src/config/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Global Error Handlers for Debugging
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

async function startServer(targetPort) {
  try {
    // Verify DB connection on first attempt
    if (targetPort === PORT) {
      await prisma.$connect();
      console.log('📦 Database connection established');
    }

    const server = app.listen(targetPort, () => {
      console.log(`🚀 Server listening on port ${targetPort}`);
      console.log(`✅ Server is fully initialized and active.`);
      if (targetPort !== PORT) {
         console.log(`⚠️ NOTE: Default port ${PORT} was busy. Dynamic port ${targetPort} is being used.`);
         console.log(`👉 Update your frontend API_BASE if needed!`);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ CRITICAL: Port ${targetPort} is already in use by another process.`);
        console.error(`👉 Please kill the existing process or use a different PORT in .env.`);
        process.exit(1);
      } else {
        console.error('❌ Server listener error:', err);
      }
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer(PORT);