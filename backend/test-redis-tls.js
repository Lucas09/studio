const { createClient } = require('redis');
require('dotenv').config();

async function testRedisTLS() {
  console.log('Testing Redis connection with TLS...');
  
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not found in environment variables');
    return;
  }

  // Parse the Redis URL to extract components
  const redisUrl = new URL(process.env.REDIS_URL);
  
  // Try with TLS enabled
  const client = createClient({
    socket: {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      tls: true, // Force TLS
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 1000);
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
    console.log('✅ Redis TLS connection successful!');
    
    // Test a simple operation
    await client.set('test', 'hello');
    const value = await client.get('test');
    console.log('✅ Redis read/write test successful:', value);
    
    await client.del('test');
    console.log('✅ Redis delete test successful');
    
  } catch (error) {
    console.error('❌ Redis TLS connection failed:', error.message);
    
    // Try without TLS
    console.log('\n🔄 Trying without TLS...');
    const clientNoTLS = createClient({
      socket: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port) || 6379,
        tls: false,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 1000);
        },
        connectTimeout: 10000,
      },
      password: redisUrl.password || undefined,
    });

    try {
      await clientNoTLS.connect();
      console.log('✅ Redis non-TLS connection successful!');
      
      await clientNoTLS.set('test', 'hello');
      const value = await clientNoTLS.get('test');
      console.log('✅ Redis read/write test successful:', value);
      
      await clientNoTLS.del('test');
      console.log('✅ Redis delete test successful');
      
      await clientNoTLS.disconnect();
    } catch (error2) {
      console.error('❌ Redis non-TLS connection also failed:', error2.message);
    }
  } finally {
    try {
      await client.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

testRedisTLS();
