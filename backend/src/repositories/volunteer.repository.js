const prisma = require("../config/db");

class VolunteerRepository {
  createAssignment(data) {
    return prisma.volunteerAssignment.create({
      data,
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });
  }

  findAllByEvent(eventId) {
    return prisma.volunteerAssignment.findMany({
      where: { eventId: Number(eventId) },
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  }

  findById(id) {
    return prisma.volunteerAssignment.findUnique({
      where: { id: Number(id) },
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  countByEvent(eventId) {
    return prisma.volunteerAssignment.count({
      where: { eventId: Number(eventId) },
    });
  }

  countCheckedInByEvent(eventId) {
    return prisma.volunteerAssignment.count({
      where: { eventId: Number(eventId), checkedIn: true },
    });
  }

  updateStatus(id, status, remarks) {
    const data = { status };
    if (remarks !== undefined) data.remarks = remarks;

    return prisma.volunteerAssignment.update({
      where: { id: Number(id) },
      data,
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  updateCheckIn(id, { checkedIn, checkedOut, checkInTime, checkOutTime }) {
    const data = {};
    if (typeof checkedIn === "boolean") data.checkedIn = checkedIn;
    if (typeof checkedOut === "boolean") data.checkedOut = checkedOut;
    if (checkInTime !== undefined) data.checkInTime = checkInTime;
    if (checkOutTime !== undefined) data.checkOutTime = checkOutTime;

    return prisma.volunteerAssignment.update({
      where: { id: Number(id) },
      data,
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

module.exports = new VolunteerRepository();
