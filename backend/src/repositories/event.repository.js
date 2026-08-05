const prisma = require("../config/db");

class EventRepository {
  create(data) {
    return prisma.event.create({
      data,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  findById(id) {
    return prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            registrations: true,
            volunteerAssignments: true,
            announcements: true,
          },
        },
      },
    });
  }

  findAllByOrganizer(organizerId, status = null) {
    const where = { createdBy: Number(organizerId) };
    if (status) {
      where.status = status;
    }

    return prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        _count: {
          select: {
            registrations: true,
            volunteerAssignments: true,
          },
        },
      },
    });
  }

  findAll(status = null) {
    const where = {};
    if (status) {
      where.status = status;
    }

    return prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        organizer: { select: { id: true, name: true } },
        _count: {
          select: {
            registrations: true,
            volunteerAssignments: true,
          },
        },
      },
    });
  }

  update(id, data) {
    return prisma.event.update({
      where: { id: Number(id) },
      data,
    });
  }

  delete(id) {
    return prisma.event.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new EventRepository();
