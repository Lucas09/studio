require('dotenv').config();

console.log('🔍 Debugging Redis Configuration...');
console.log('=====================================');

if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL not found in environment variables');
  console.log('Make sure you have a .env file with REDIS_URL set');
  process.exit(1);
}

console.log('✅ REDIS_URL is set');
console.log('URL format:', process.env.REDIS_URL.substring(0, 20) + '...');

try {
  const redisUrl = new URL(process.env.REDIS_URL);
  
  console.log('\n📋 Parsed Redis URL:');
  console.log('Protocol:', redisUrl.protocol);
  console.log('Hostname:', redisUrl.hostname);
  console.log('Port:', redisUrl.port || '6379 (default)');
  console.log('Username:', redisUrl.username || 'none');
  console.log('Password:', redisUrl.password ? '***' + redisUrl.password.slice(-4) : 'none');
  console.log('Pathname:', redisUrl.pathname);
  
  console.log('\n🔧 Expected Upstash format:');
  console.log('Protocol: redis:// or rediss://');
  console.log('Hostname: redis-xxx.upstash.io');
  console.log('Port: 6379 or 6380');
  console.log('Username: default');
  console.log('Password: your-upstash-password');
  
  console.log('\n✅ URL format looks correct!');
  
} catch (error) {
  console.error('❌ Invalid Redis URL format:', error.message);
  console.log('\n🔧 Your URL should look like:');
  console.log('redis://default:your-password@redis-xxx.upstash.io:6379');
  console.log('or');
  console.log('rediss://default:your-password@redis-xxx.upstash.io:6380');
}
