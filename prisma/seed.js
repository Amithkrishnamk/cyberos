const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CYBER // OS database...');

  const studentEmail = process.env.SEED_STUDENT_EMAIL || 'student@cyberos.dev';
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'password123';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cyberos.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const studentHash = await bcrypt.hash(studentPassword, 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      name: 'Alex Rivera',
      passwordHash: studentHash,
      role: 'STUDENT',
      theme: 'cyan',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Instructor Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      theme: 'cyan',
    },
  });

  console.log('Created Users:', {
    student: student.email,
    admin: admin.email,
  });

  // Create Initial Notes
  const note1 = await prisma.note.upsert({
    where: { id: 'note-sqli-01' },
    update: {},
    create: {
      id: 'note-sqli-01',
      userId: student.id,
      title: 'SQL Injection: Advanced Bypass & Union Exploitation',
      category: 'Web Security',
      tags: JSON.stringify(['OWASP', 'SQLi', 'Pentesting']),
      description: 'Comprehensive analysis of UNION-based SQL injection techniques, column count identification, and data extraction.',
      icon: '🛡️',
      coverImage: 'linear-gradient(to right, #06201b, #0f4c3a, #06201b)',
      masteryPercent: 85,
      timeStudiedMinutes: 145,
      content: JSON.stringify([
        { id: 'b-1', type: 'heading1', content: '1. Executive Summary' },
        { id: 'b-2', type: 'paragraph', content: 'SQL injection remains a critical OWASP Top 10 vulnerability allowing attackers to manipulate backend SQL queries via untrusted user input.' },
        { id: 'b-3', type: 'heading2', content: '2. Union-Based Payload Syntax' },
        { id: 'b-4', type: 'cmd', content: "' UNION SELECT NULL, NULL, @@version, NULL-- -" },
        { id: 'b-5', type: 'vuln', content: 'Unsanitized parameter handling in authentication search filter', cveId: 'CVE-2024-8891', severity: 'Critical' },
        { id: 'b-6', type: 'concept', content: 'UNION operator requires identical column counts and compatible data types across query results.' }
      ]),
    },
  });

  const note2 = await prisma.note.upsert({
    where: { id: 'note-ad-01' },
    update: {},
    create: {
      id: 'note-ad-01',
      userId: student.id,
      title: 'Active Directory: Kerberoasting Attack Methodology',
      category: 'Active Directory',
      tags: JSON.stringify(['Kerberos', 'AD', 'PrivEsc']),
      description: 'Requesting TGS tickets for SPNs and offline cracking with Hashcat.',
      icon: '🔑',
      coverImage: 'linear-gradient(to right, #1d0f36, #3b1b6e, #1d0f36)',
      masteryPercent: 70,
      timeStudiedMinutes: 90,
      content: JSON.stringify([
        { id: 'b-1', type: 'heading1', content: 'Kerberoasting Workflow' },
        { id: 'b-2', type: 'paragraph', content: 'Target service accounts with SPNs configured to request encrypted TGS tickets.' },
        { id: 'b-3', type: 'cmd', content: 'GetUserSPNs.py -request -dc-ip 10.10.10.10 domain.local/user' }
      ]),
    },
  });

  // Create Study Sessions
  await prisma.studySession.create({
    data: {
      userId: student.id,
      startedAt: new Date(Date.now() - 3600000 * 24 * 2),
      endedAt: new Date(Date.now() - 3600000 * 24 * 2 + 3600000 * 1.5),
      durationMinutes: 90,
      category: 'Web Security',
      linkedNoteId: note1.id,
      contentStudied: 'Reviewed SQLi Union queries and error-based injection.',
      difficulties: 'Understanding second-order SQL injection timing.',
      nextSteps: 'Practice PortSwigger Blind SQLi lab.',
    },
  });

  // Create Lab Completion
  await prisma.labCompletion.create({
    data: {
      userId: student.id,
      labName: 'PortSwigger: SQL injection UNION attack',
      category: 'Web Security',
      timeTakenMin: 25,
      keyLearnings: 'Used UNION SELECT null, null to identify column count.',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
