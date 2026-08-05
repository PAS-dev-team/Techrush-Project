const eventService = require("../services/event.service");
const registrationRepository = require("../repositories/registration.repository");
const volunteerRepository = require("../repositories/volunteer.repository");
const userRepository = require("../repositories/user.repository");
const { success, AppError } = require("../utils/response");

class EventController {
  async create(req, res, next) {
    try {
      const event = await eventService.createEvent(req.user.id, req.body);
      return success(res, event, "Event created successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const events = await eventService.getEventsForOrganizer(req.user.id, status);
      return success(res, events, "Events retrieved successfully");
    } catch (err) {
      next(err);
    }
  }

  async getOne(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      return success(res, event, "Event details retrieved");
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await eventService.updateEvent(req.params.id, req.user.id, req.body);
      return success(res, updated, "Event updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await eventService.deleteEvent(req.params.id, req.user.id);
      return success(res, null, "Event deleted successfully");
    } catch (err) {
      next(err);
    }
  }

  // --- Registrations & Attendance ---
  async getRegistrations(req, res, next) {
    try {
      const registrations = await registrationRepository.findAllByEvent(req.params.eventId);
      return success(res, registrations, "Registrations retrieved");
    } catch (err) {
      next(err);
    }
  }

  async checkInAttendee(req, res, next) {
    try {
      const { id } = req.params;
      const { checkedIn, checkedOut } = req.body;
      const now = new Date();

      const updateData = {};
      if (typeof checkedIn === "boolean") {
        updateData.checkedIn = checkedIn;
        updateData.checkInTime = checkedIn ? now : null;
      }
      if (typeof checkedOut === "boolean") {
        updateData.checkedOut = checkedOut;
        updateData.checkOutTime = checkedOut ? now : null;
      }

      const updated = await registrationRepository.updateCheckInStatus(id, updateData);
      return success(res, updated, "Attendee check-in status updated");
    } catch (err) {
      next(err);
    }
  }

  async verifyQrToken(req, res, next) {
    try {
      const { qrToken } = req.body;
      const registration = await registrationRepository.findByQrToken(qrToken);
      if (!registration) {
        throw new AppError("Invalid QR code token", 404);
      }

      if (registration.eventId !== Number(req.params.eventId)) {
        throw new AppError("QR token does not match this event", 400);
      }

      const now = new Date();
      const updated = await registrationRepository.updateCheckInStatus(registration.id, {
        checkedIn: true,
        checkInTime: now,
      });

      return success(res, updated, `Successfully checked in ${registration.user.name}`);
    } catch (err) {
      next(err);
    }
  }

  // --- Volunteers ---
  async getVolunteers(req, res, next) {
    try {
      const volunteers = await volunteerRepository.findAllByEvent(req.params.eventId);
      return success(res, volunteers, "Volunteers list retrieved");
    } catch (err) {
      next(err);
    }
  }

  async getAvailableVolunteers(req, res, next) {
    try {
      const allUsers = await userRepository.findAll();
      const volunteers = allUsers.filter((u) => u.role === "VOLUNTEER" || u.role === "ATTENDEE");
      return success(res, volunteers, "Available volunteer users retrieved");
    } catch (err) {
      next(err);
    }
  }

  async assignVolunteer(req, res, next) {
    try {
      const { volunteerId, task, remarks } = req.body;
      const eventId = Number(req.params.eventId);

      const assignment = await volunteerRepository.createAssignment({
        eventId,
        volunteerId: Number(volunteerId),
        task,
        remarks: remarks || null,
      });

      return success(res, assignment, "Volunteer assigned successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  async updateVolunteerStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const updated = await volunteerRepository.updateStatus(id, status, remarks);
      return success(res, updated, "Volunteer status updated");
    } catch (err) {
      next(err);
    }
  }

  async checkInVolunteer(req, res, next) {
    try {
      const { id } = req.params;
      const { checkedIn, checkedOut } = req.body;
      const now = new Date();

      const updateData = {};
      if (typeof checkedIn === "boolean") {
        updateData.checkedIn = checkedIn;
        updateData.checkInTime = checkedIn ? now : null;
      }
      if (typeof checkedOut === "boolean") {
        updateData.checkedOut = checkedOut;
        updateData.checkOutTime = checkedOut ? now : null;
      }

      const updated = await volunteerRepository.updateCheckIn(id, updateData);
      return success(res, updated, "Volunteer check-in updated");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventController();
