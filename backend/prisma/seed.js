const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const qrToken = () => crypto.randomUUID();

async function main() {
  console.log("Seeding database...");

  const existingCount = await prisma.user.count();

  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} users. Skipping seed to avoid duplicates.`);
    return;
  }

  const hash = (password) => bcrypt.hashSync(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { name: "Admin User", email: "admin@demo.com", passwordHash: hash("admin123"), role: "ADMIN" },
  });

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@demo.com" },
    update: {},
    create: { name: "Organizer User", email: "organizer@demo.com", passwordHash: hash("organizer123"), role: "ORGANIZER" },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: "volunteer@demo.com" },
    update: {},
    create: { name: "Volunteer User", email: "volunteer@demo.com", passwordHash: hash("volunteer123"), role: "VOLUNTEER" },
  });

  const attendee = await prisma.user.upsert({
    where: { email: "attendee@demo.com" },
    update: {},
    create: { name: "Attendee User", email: "attendee@demo.com", passwordHash: hash("attendee123"), role: "ATTENDEE" },
  });

  const eventData = {
    title: "TechRush Hackathon 2026",
    description: "A 24-hour build sprint for the fullstack event management portal.",
    venue: "Main Auditorium",
    capacity: 200,
    startTime: new Date("2026-08-10T09:00:00Z"),
    endTime: new Date("2026-08-11T09:00:00Z"),
    status: "UPCOMING",
    createdBy: organizer.id,
  };

  const event = await prisma.event.create({ data: eventData });

  await prisma.volunteerAssignment.create({
    data: {
      eventId: event.id,
      volunteerId: volunteer.id,
      task: "Gate A QR Scanner",
      status: "PENDING",
      remarks: "Bring a charged tablet.",
    },
  });

  await prisma.announcement.create({
    data: {
      eventId: event.id,
      title: "Welcome to TechRush",
      message: "Check-in opens at 8:30 AM. See you at the auditorium!",
      createdBy: organizer.id,
    },
  });

  const sampleNames = [
    "Alice Smith", "Bob Johnson", "Carol Lee", "David Kim", "Emma Brown",
    "Frank Miller", "Grace Davis", "Henry Wilson", "Ivy Moore", "Jack Taylor",
  ];

  const createdAttendees = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: sampleNames[i],
        email: `attendee${i + 1}@demo.com`,
        passwordHash: hash("attendee123"),
        role: "ATTENDEE",
      },
    });
    createdAttendees.push(user);
  }

  const registrations = [];
  for (let i = 0; i < createdAttendees.length; i++) {
    const checkIn = i % 2 === 0;
    registrations.push(
      prisma.registration.create({
        data: {
          userId: createdAttendees[i].id,
          eventId: event.id,
          qrToken: qrToken(),
          checkedIn: checkIn,
          checkedOut: checkIn && i % 4 === 0,
          checkInTime: checkIn ? new Date("2026-08-10T08:45:00Z") : null,
          checkOutTime: checkIn && i % 4 === 0 ? new Date("2026-08-10T10:45:00Z") : null,
        },
      })
    );
  }
  await prisma.$transaction(registrations);

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log("  admin@demo.com / admin123");
  console.log("  organizer@demo.com / organizer123");
  console.log("  volunteer@demo.com / volunteer123");
  console.log("  attendee@demo.com  / attendee123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());