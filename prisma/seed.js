const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CYBER // OS database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cyberos.dev';
  const adminRawPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const studentEmail = process.env.SEED_STUDENT_EMAIL || 'student@cyberos.dev';
  const studentRawPassword = process.env.SEED_STUDENT_PASSWORD || 'password123';

  // Password hashes
  const studentPassword = await bcrypt.hash(studentRawPassword, 10);
  const adminPassword = await bcrypt.hash(adminRawPassword, 10);

  // Clear existing users
  await prisma.user.deleteMany({});

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: studentEmail,
      name: 'Alex Mercer (Student)',
      passwordHash: studentPassword,
      role: 'STUDENT',
      theme: 'cyan',
    },
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Instructor Vance (Admin)',
      passwordHash: adminPassword,
      role: 'ADMIN',
      theme: 'emerald',
    },
  });

  console.log('Created Users:', { student: student.email, admin: admin.email });

  // Create Sample Notes for Student
  const note1 = await prisma.note.create({
    data: {
      userId: student.id,
      title: 'SQL Injection Exploitation & Prevention',
      category: 'Web Security',
      tags: JSON.stringify(['OWASP', 'SQLi', 'Web', 'Pentesting']),
      masteryPercent: 85,
      timeStudiedMinutes: 120,
      icon: '🛡️',
      description: 'In-depth breakdown of Error-based, Blind, and Union SQLi payloads.',
      content: JSON.stringify([
        {
          id: 'b1',
          type: 'heading1',
          content: 'SQL Injection Deep Dive',
        },
        {
          id: 'b2',
          type: 'paragraph',
          content: 'SQL Injection occurs when untrusted user input is concatenated directly into dynamic SQL database queries without parameterization.',
        },
        {
          id: 'b3',
          type: 'concept',
          content: 'Key Concept: Parameterized Queries (Prepared Statements) ensure database engines treat user input strictly as data parameters, preventing code injection execution.',
        },
        {
          id: 'b4',
          type: 'cmd',
          content: 'sqlmap -u "http://target.lab/product.php?id=1" --dbs --batch',
        },
        {
          id: 'b5',
          type: 'vuln',
          cveId: 'CVE-2023-34362',
          severity: 'Critical',
          vulnerabilityDescription: 'MOVEit Transfer SQL Injection flaw allowing unauthenticated remote code execution.',
        },
        {
          id: 'b6',
          type: 'code',
          language: 'sql',
          content: '-- Union Based Payload\nSELECT username, password FROM users WHERE id = 1 UNION SELECT 1, @@version--',
        },
      ]),
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: student.id,
      title: 'Linux Privilege Escalation Techniques',
      category: 'Linux',
      tags: JSON.stringify(['Linux', 'PrivEsc', 'SUID', 'Capabilities']),
      masteryPercent: 70,
      timeStudiedMinutes: 90,
      icon: '🐧',
      description: 'Enumeration commands for SUID bits, sudo rights, and misconfigured cron jobs.',
      content: JSON.stringify([
        {
          id: 'b10',
          type: 'heading1',
          content: 'Linux SUID Enumeration',
        },
        {
          id: 'b11',
          type: 'cmd',
          content: 'find / -perm -4000 -type f -ls 2>/dev/null',
        },
        {
          id: 'b12',
          type: 'bullet',
          content: 'GTFOBins search for binaries with SUID enabled (e.g. nmap, vim, find, env).',
        },
        {
          id: 'b13',
          type: 'checklist',
          content: 'Check sudo privileges with sudo -l',
          checked: true,
        },
        {
          id: 'b14',
          type: 'checklist',
          content: 'Check system cron jobs in /etc/crontab',
          checked: false,
        },
      ]),
    },
  });

  // Create Study Sessions
  await prisma.studySession.create({
    data: {
      userId: student.id,
      linkedNoteId: note1.id,
      category: 'Web Security',
      startedAt: new Date(Date.now() - 3600000 * 2),
      endedAt: new Date(Date.now() - 3600000 * 1),
      durationMinutes: 60,
      contentStudied: 'Mastered Union-based SQLi payloads and practiced sqlmap automation.',
      difficulties: 'Struggled with understanding blind time-based boolean extraction delays.',
      nextSteps: 'Practice manual time-based payload construction on PortSwigger Web Security Academy.',
    },
  });

  await prisma.studySession.create({
    data: {
      userId: student.id,
      linkedNoteId: note2.id,
      category: 'Linux',
      startedAt: new Date(Date.now() - 86400000 * 1),
      endedAt: new Date(Date.now() - 86400000 * 1 + 2700000),
      durationMinutes: 45,
      contentStudied: 'SUID bit enumeration & GTFOBins exploitation paths.',
      difficulties: 'Confused by Linux capability syntax (cap_setuid+ep vs SUID bit).',
      nextSteps: 'Set up custom lab VM with custom SUID binaries.',
    },
  });

  // Create Lab Completions
  await prisma.labCompletion.create({
    data: {
      userId: student.id,
      labName: 'PortSwigger: SQL injection UNION attack',
      notes: 'Completed in 25 mins. Used UNION SELECT null, null to identify column count.',
    },
  });

  // Create Concepts
  await prisma.concept.create({
    data: {
      userId: student.id,
      title: 'Same-Origin Policy (SOP)',
      description: 'Core web browser security mechanism restricting how a document or script loaded from one origin can interact with a resource from another origin.',
      relatedNoteId: note1.id,
    },
  });

  console.log('Database successfully seeded with environment-driven credentials!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
