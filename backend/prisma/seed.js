import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo users:');
  console.log(`   - ${user1.email}`);
  console.log(`   - ${user2.email}`);

  // Create demo notes for user1
  const note1 = await prisma.note.create({
    data: {
      title: 'Welcome to Notes App',
      content: '# Welcome to Notes App\nThis is a demo note with multiple block types.\n• Bullet point 1\n• Bullet point 2\n---\n> This is a quote block',
      blocks: [
        {
          id: '1',
          type: 'heading1',
          content: 'Welcome to Notes App',
        },
        {
          id: '2',
          type: 'text',
          content: 'This is a demo note with multiple block types.',
        },
        {
          id: '3',
          type: 'bullet',
          content: 'Bullet point 1',
        },
        {
          id: '4',
          type: 'bullet',
          content: 'Bullet point 2',
        },
        {
          id: '5',
          type: 'divider',
          content: '',
        },
        {
          id: '6',
          type: 'quote',
          content: 'This is a quote block',
        },
      ],
      color: '#ffffff',
      tags: ['demo', 'welcome'],
      isPinned: true,
      ownerId: user1.id,
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'JavaScript Tips',
      content: '# JavaScript Tips\n## Arrow Functions\nArrow functions provide a concise syntax for writing functions.\n```javascript\nconst add = (a, b) => a + b;\n```',
      blocks: [
        {
          id: '1',
          type: 'heading1',
          content: 'JavaScript Tips',
        },
        {
          id: '2',
          type: 'heading2',
          content: 'Arrow Functions',
        },
        {
          id: '3',
          type: 'text',
          content: 'Arrow functions provide a concise syntax for writing functions.',
        },
        {
          id: '4',
          type: 'code',
          content: 'const add = (a, b) => a + b;',
          language: 'javascript',
        },
      ],
      color: '#e8a045',
      tags: ['javascript', 'programming'],
      isPinned: false,
      ownerId: user1.id,
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: 'Todo List',
      content: '✓ Complete project setup\n○ Write documentation\n○ Deploy to production',
      blocks: [
        {
          id: '1',
          type: 'todo',
          content: 'Complete project setup',
          checked: true,
        },
        {
          id: '2',
          type: 'todo',
          content: 'Write documentation',
          checked: false,
        },
        {
          id: '3',
          type: 'todo',
          content: 'Deploy to production',
          checked: false,
        },
      ],
      color: '#ffffff',
      tags: ['todo', 'project'],
      isPinned: false,
      ownerId: user1.id,
    },
  });

  console.log('✅ Created demo notes:');
  console.log(`   - ${note1.title}`);
  console.log(`   - ${note2.title}`);
  console.log(`   - ${note3.title}`);

  // Share note1 with user2
  const share = await prisma.noteShare.create({
    data: {
      noteId: note1.id,
      userId: user2.id,
      ownerId: user1.id,
    },
  });

  console.log('✅ Shared notes:');
  console.log(`   - ${user1.email} shared "${note1.title}" with ${user2.email}`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: alice@example.com');
  console.log('   Password: demo123456');
  console.log('\n   Email: bob@example.com');
  console.log('   Password: demo123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
