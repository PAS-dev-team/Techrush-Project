const prisma = require("../config/db");

class RegistrationRepository {
  create(data) {
    return prisma.registration.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  findByUserAndEvent(userId, eventId) {
    return prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: Number(userId),
          eventId: Number(eventId),
        },
      },
    });
  }

  findByQrToken(qrToken) {
    return prisma.registration.findUnique({
      where: { qrToken },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });
  }

  findAllByEvent(eventId) {
    return prisma.registration.findMany({
      where: { eventId: Number(eventId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { registeredAt: "desc" },
    });
  }

  countByEvent(eventId) {
    return prisma.registration.count({
      where: { eventId: Number(eventId) },
    });
  }

  countCheckedInByEvent(eventId) {
    return prisma.registration.count({
      where: { eventId: Number(eventId), checkedIn: true },
    });
  }

  updateCheckInStatus(id, { checkedIn, checkedOut, checkInTime, checkOutTime }) {
    const data = {};
    if (typeof checkedIn === "boolean") data.checkedIn = checkedIn;
    if (typeof checkedOut === "boolean") data.checkedOut = checkedOut;
    if (checkInTime !== undefined) data.checkInTime = checkInTime;
    if (checkOutTime !== undefined) data.checkOutTime = checkOutTime;

    return prisma.registration.update({
      where: { id: Number(id) },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

module.exports = new RegistrationRepository();
