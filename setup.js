#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 AI Medical Scribe Setup');
console.log('==========================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created successfully!');
  console.log('⚠️  Please update the OPENAI_API_KEY with your actual API key.\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

console.log('🚀 Next steps:');
console.log('1. Update your OpenAI API key in .env.local');
console.log('2. Run: npm install');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma db push');
console.log('5. Run: npx prisma db seed');
console.log('6. Run: npm run dev');
console.log('\n🎉 Your AI Medical Scribe will be ready at http://localhost:3000');
