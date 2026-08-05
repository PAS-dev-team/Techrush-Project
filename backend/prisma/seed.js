const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const qrToken = () => crypto.randomUUID();
const hash = (password) => bcrypt.hashSync(password, 10);

async function main() {
  console.log("Cleaning database & seeding rich EventOS dataset...");

  // Reset existing records
  await prisma.announcement.deleteMany({});
  await prisma.volunteerAssignment.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  const now = new Date();

  // 1. Create Core Users
  const admin = await prisma.user.create({
    data: { name: "System Admin", email: "admin@demo.com", passwordHash: hash("admin123"), role: "ADMIN" },
  });

  const organizer = await prisma.user.create({
    data: { name: "Alex Morgan", email: "organizer@demo.com", passwordHash: hash("organizer123"), role: "ORGANIZER" },
  });

  // 2. Create Volunteers (12 volunteers)
  const volunteerNames = [
    "Sarah Connor", "John Doe", "Emily Blunt", "Marcus Vance",
    "Jessica Alba", "Tom Holland", "Zendaya Coleman", "Chris Evans",
    "Scarlett Johansson", "Robert Downey", "Paul Rudd", "Brie Larson",
  ];

  const volunteers = [];
  for (let i = 0; i < volunteerNames.length; i++) {
    const vol = await prisma.user.create({
      data: {
        name: volunteerNames[i],
        email: `volunteer${i + 1}@demo.com`,
        passwordHash: hash("volunteer123"),
        role: "VOLUNTEER",
      },
    });
    volunteers.push(vol);
  }

  // 3. Create Attendees (40 attendees)
  const attendeeFirstNames = ["Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily"];
  const attendeeLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

  const attendees = [];
  for (let i = 0; i < 40; i++) {
    const fn = attendeeFirstNames[i % attendeeFirstNames.length];
    const ln = attendeeLastNames[(i * 3) % attendeeLastNames.length];
    const att = await prisma.user.create({
      data: {
        name: `${fn} ${ln}`,
        email: `attendee${i + 1}@demo.com`,
        passwordHash: hash("attendee123"),
        role: "ATTENDEE",
      },
    });
    attendees.push(att);
  }

  // 4. Create 3 Realistic Events created by Organiser
  const event1 = await prisma.event.create({
    data: {
      title: "TechRush Hackathon 2026",
      description: "A flagship 24-hour build sprint for full-stack, AI, and cloud developer teams.",
      venue: "Main Innovation Auditorium, Hall B",
      capacity: 150,
      startTime: new Date(now.getTime() - 4 * 3600 * 1000), // Started 4 hrs ago
      endTime: new Date(now.getTime() + 20 * 3600 * 1000), // Ends in 20 hrs
      status: "ONGOING",
      createdBy: organizer.id,
      createdAt: new Date(now.getTime() - 14 * 86400 * 1000), // Created 14 days ago
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "AI & Cloud Innovation Summit 2026",
      description: "Keynotes, panel discussions, and hands-on workshops on GenAI, LLMs, and distributed systems.",
      venue: "Grand Convention Center, Room 402",
      capacity: 250,
      startTime: new Date(now.getTime() + 5 * 86400 * 1000), // In 5 days
      endTime: new Date(now.getTime() + 6 * 86400 * 1000),
      status: "UPCOMING",
      createdBy: organizer.id,
      createdAt: new Date(now.getTime() - 10 * 86400 * 1000), // Created 10 days ago
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "DevOps & Cybersecurity Masterclass",
      description: "Deep-dive session covering Kubernetes security, CI/CD pipelines, and zero-trust architecture.",
      venue: "Tech Hub TechLab 1",
      capacity: 80,
      startTime: new Date(now.getTime() - 7 * 86400 * 1000), // 7 days ago
      endTime: new Date(now.getTime() - 6 * 86400 * 1000),
      status: "COMPLETED",
      createdBy: organizer.id,
      createdAt: new Date(now.getTime() - 20 * 86400 * 1000), // Created 20 days ago
    },
  });

  // 5. Seed Staggered Registrations & Attendance for Event 1 (TechRush Hackathon - ONGOING)
  // 30 Attendees registered over past 12 days
  for (let i = 0; i < 30; i++) {
    const daysAgoRegistered = 12 - Math.floor((i / 30) * 12);
    const regDate = new Date(now.getTime() - daysAgoRegistered * 86400 * 1000 - Math.random() * 3600 * 1000);
    
    // ~80% checked in for event 1
    const isCheckedIn = i < 24;
    const checkInTime = isCheckedIn ? new Date(event1.startTime.getTime() + (Math.random() * 45 - 15) * 60 * 1000) : null;
    const isCheckedOut = isCheckedIn && i < 6;
    const checkOutTime = isCheckedOut ? new Date(checkInTime.getTime() + 2 * 3600 * 1000) : null;

    await prisma.registration.create({
      data: {
        userId: attendees[i].id,
        eventId: event1.id,
        qrToken: qrToken(),
        registeredAt: regDate,
        checkedIn: isCheckedIn,
        checkedOut: isCheckedOut,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
      },
    });
  }

  // 8 Volunteers for Event 1
  const tasksEvent1 = [
    "Gate A QR Check-in", "Gate B Pass Distribution", "Stage Audio Tech",
    "Q&A Microphone Handler", "VIP Guest Desk", "Refreshment & Snacks Control",
    "Helpdesk & Navigation", "Emergency & First Aid Assistant",
  ];

  for (let i = 0; i < 8; i++) {
    const isCheckedIn = i < 7; // ~87% volunteer check-in
    await prisma.volunteerAssignment.create({
      data: {
        eventId: event1.id,
        volunteerId: volunteers[i].id,
        task: tasksEvent1[i],
        status: isCheckedIn ? "IN_PROGRESS" : "PENDING",
        remarks: isCheckedIn ? "On duty at station." : "Pending check-in.",
        checkedIn: isCheckedIn,
        checkedOut: false,
        checkInTime: isCheckedIn ? new Date(event1.startTime.getTime() - 30 * 60 * 1000) : null,
        assignedAt: new Date(now.getTime() - (8 - i) * 86400 * 1000),
      },
    });
  }

  // 6. Seed Registrations for Event 2 (AI Summit - UPCOMING)
  // 22 Attendees registered over past 8 days
  for (let i = 0; i < 22; i++) {
    const daysAgoRegistered = 8 - Math.floor((i / 22) * 8);
    const regDate = new Date(now.getTime() - daysAgoRegistered * 86400 * 1000 - Math.random() * 3600 * 1000);

    await prisma.registration.create({
      data: {
        userId: attendees[10 + i].id,
        eventId: event2.id,
        qrToken: qrToken(),
        registeredAt: regDate,
        checkedIn: false,
        checkedOut: false,
      },
    });
  }

  // 5 Volunteers for Event 2
  for (let i = 0; i < 5; i++) {
    await prisma.volunteerAssignment.create({
      data: {
        eventId: event2.id,
        volunteerId: volunteers[i + 2].id,
        task: `AI Summit Task ${i + 1}: Room Control`,
        status: "PENDING",
        remarks: "Orientation scheduled day prior.",
        assignedAt: new Date(now.getTime() - (5 - i) * 86400 * 1000),
      },
    });
  }

  // 7. Seed Registrations & Attendance for Event 3 (DevOps Masterclass - COMPLETED)
  // 35 Attendees registered & ~30 checked in
  for (let i = 0; i < 35; i++) {
    const daysAgoRegistered = 18 - Math.floor((i / 35) * 10);
    const regDate = new Date(now.getTime() - daysAgoRegistered * 86400 * 1000);

    const isCheckedIn = i < 30; // 85% attendance
    const checkInTime = isCheckedIn ? new Date(event3.startTime.getTime() + Math.random() * 30 * 60 * 1000) : null;
    const checkOutTime = isCheckedIn ? new Date(event3.endTime.getTime() - Math.random() * 15 * 60 * 1000) : null;

    await prisma.registration.create({
      data: {
        userId: attendees[i % attendees.length].id,
        eventId: event3.id,
        qrToken: qrToken(),
        registeredAt: regDate,
        checkedIn: isCheckedIn,
        checkedOut: isCheckedIn,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
      },
    });
  }

  // 6 Volunteers for Event 3 (All Completed)
  for (let i = 0; i < 6; i++) {
    await prisma.volunteerAssignment.create({
      data: {
        eventId: event3.id,
        volunteerId: volunteers[i + 5].id,
        task: `Masterclass Lab Assistant ${i + 1}`,
        status: "COMPLETED",
        remarks: "Completed duty successfully.",
        checkedIn: true,
        checkedOut: true,
        checkInTime: new Date(event3.startTime.getTime() - 45 * 60 * 1000),
        checkOutTime: new Date(event3.endTime.getTime() + 15 * 60 * 1000),
        assignedAt: new Date(now.getTime() - 15 * 86400 * 1000),
      },
    });
  }

  // 8. Seed Announcements
  await prisma.announcement.createMany({
    data: [
      {
        eventId: event1.id,
        title: "Welcome to TechRush Hackathon!",
        message: "Check-in desk is active at Main Auditorium Gate A. Grab your hacker badges!",
        createdBy: organizer.id,
        createdAt: new Date(now.getTime() - 3 * 3600 * 1000),
      },
      {
        eventId: event1.id,
        title: "Lunch & Refreshments Served",
        message: "Lunch counter is open at Food Court. Please present your event QR code.",
        createdBy: organizer.id,
        createdAt: new Date(now.getTime() - 1 * 3600 * 1000),
      },
      {
        eventId: event2.id,
        title: "AI Summit Speaker Lineup Released",
        message: "Check out the schedule for keynotes on GenAI and LLM fine-tuning.",
        createdBy: organizer.id,
        createdAt: new Date(now.getTime() - 2 * 86400 * 1000),
      },
    ],
  });

  console.log("Seeding finished successfully!");
  console.log("Demo Credentials:");
  console.log("  Organiser : organizer@demo.com / organizer123");
  console.log("  Volunteer : volunteer1@demo.com / volunteer123");
  console.log("  Attendee  : attendee1@demo.com / attendee123");
  console.log("  Admin     : admin@demo.com / admin123");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());