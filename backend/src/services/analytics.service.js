const prisma = require("../config/db");
const eventRepository = require("../repositories/event.repository");
const registrationRepository = require("../repositories/registration.repository");
const volunteerRepository = require("../repositories/volunteer.repository");
const { AppError } = require("../utils/response");

class AnalyticsService {
  async getDashboardSummary(organizerId) {
    const events = await eventRepository.findAllByOrganizer(organizerId);

    const totalEvents = events.length;
    const activeEvents = events.filter((e) => e.status === "ONGOING" || e.status === "UPCOMING").length;

    let totalRegistrations = 0;
    let totalCheckedInAttendees = 0;
    let totalVolunteers = 0;
    let totalCheckedInVolunteers = 0;

    for (const event of events) {
      const regCount = await registrationRepository.countByEvent(event.id);
      const regCheckedIn = await registrationRepository.countCheckedInByEvent(event.id);
      const volCount = await volunteerRepository.countByEvent(event.id);
      const volCheckedIn = await volunteerRepository.countCheckedInByEvent(event.id);

      totalRegistrations += regCount;
      totalCheckedInAttendees += regCheckedIn;
      totalVolunteers += volCount;
      totalCheckedInVolunteers += volCheckedIn;
    }

    const overallAttendeeAttendancePercentage = totalRegistrations > 0
      ? Math.round((totalCheckedInAttendees / totalRegistrations) * 100)
      : 0;

    const overallVolunteerAttendancePercentage = totalVolunteers > 0
      ? Math.round((totalCheckedInVolunteers / totalVolunteers) * 100)
      : 0;

    const totalParticipants = totalRegistrations + totalVolunteers;
    const totalCheckedInParticipants = totalCheckedInAttendees + totalCheckedInVolunteers;
    const overallAttendancePercentage = totalParticipants > 0
      ? Math.round((totalCheckedInParticipants / totalParticipants) * 100)
      : 0;

    // Recent Activity Log
    const recentRegistrations = await prisma.registration.findMany({
      take: 5,
      orderBy: { registeredAt: "desc" },
      include: {
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
    });

    const recentActivity = recentRegistrations.map((r) => ({
      id: r.id,
      text: `${r.user.name} registered for ${r.event.title}`,
      time: r.registeredAt,
      type: "REGISTRATION",
    }));

    return {
      summary: {
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalCheckedInAttendees,
        attendeeAttendancePercentage: overallAttendeeAttendancePercentage,
        totalVolunteers,
        totalCheckedInVolunteers,
        volunteerAttendancePercentage: overallVolunteerAttendancePercentage,
        overallAttendancePercentage,
      },
      recentActivity,
      eventsOverview: events,
    };
  }

  async getEventAnalytics(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const registrations = await registrationRepository.findAllByEvent(eventId);
    const volunteers = await volunteerRepository.findAllByEvent(eventId);

    const totalRegistrations = registrations.length;
    const checkedInAttendees = registrations.filter((r) => r.checkedIn).length;
    const attendeeAttendancePercentage = totalRegistrations > 0
      ? Math.round((checkedInAttendees / totalRegistrations) * 100)
      : 0;

    const totalVolunteers = volunteers.length;
    const checkedInVolunteers = volunteers.filter((v) => v.checkedIn).length;
    const volunteerAttendancePercentage = totalVolunteers > 0
      ? Math.round((checkedInVolunteers / totalVolunteers) * 100)
      : 0;

    const totalParticipants = totalRegistrations + totalVolunteers;
    const totalCheckedIn = checkedInAttendees + checkedInVolunteers;
    const overallAttendancePercentage = totalParticipants > 0
      ? Math.round((totalCheckedIn / totalParticipants) * 100)
      : 0;

    // Registration Trend: Group registrations by date
    const trendMap = {};

    // Populate dates starting from event creation date up to today/event start
    const startDate = new Date(event.createdAt);
    const endDate = new Date();
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      trendMap[dateStr] = { date: dateStr, attendees: 0, volunteers: 0, cumulativeAttendees: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    registrations.forEach((r) => {
      const dateStr = new Date(r.registeredAt).toISOString().split("T")[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].attendees += 1;
      }
    });

    volunteers.forEach((v) => {
      const dateStr = new Date(v.assignedAt).toISOString().split("T")[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].volunteers += 1;
      }
    });

    // Compute cumulative trend for charts
    let runningAttendeeTotal = 0;
    const trendArray = Object.values(trendMap).map((item) => {
      runningAttendeeTotal += item.attendees;
      return {
        ...item,
        cumulativeAttendees: runningAttendeeTotal,
      };
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
        capacity: event.capacity,
      },
      metrics: {
        totalRegistrations,
        checkedInAttendees,
        attendeeAttendancePercentage,
        totalVolunteers,
        checkedInVolunteers,
        volunteerAttendancePercentage,
        totalParticipants,
        totalCheckedIn,
        overallAttendancePercentage,
      },
      registrationTrend: trendArray,
    };
  }
}

module.exports = new AnalyticsService();
