const { createClient } = require('redis');
require('dotenv').config();

async function testRedis() {
  console.log('Testing Redis connection...');
  console.log('Redis URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
  
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not found in environment variables');
    return;
  }

  // Parse the Redis URL to extract components
  const redisUrl = new URL(process.env.REDIS_URL);
  
  const client = createClient({
    socket: {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      tls: redisUrl.protocol === 'rediss:',
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 10000,
    },
    password: redisUrl.password || undefined,
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('Redis Client Ready');
  });

  client.on('end', () => {
    console.log('Redis Client Disconnected');
  });

  try {
    await client.connect();
    console.log('✅ Redis connection successful!');
    
    // Test a simple operation
    await client.set('test', 'hello');
    const value = await client.get('test');
    console.log('✅ Redis read/write test successful:', value);
    
    await client.del('test');
    console.log('✅ Redis delete test successful');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  } finally {
    await client.disconnect();
  }
}

testRedis();
