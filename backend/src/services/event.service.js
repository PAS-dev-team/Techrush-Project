const eventRepository = require("../repositories/event.repository");
const registrationRepository = require("../repositories/registration.repository");
const volunteerRepository = require("../repositories/volunteer.repository");
const { AppError } = require("../utils/response");

class EventService {
  async createEvent(organizerId, eventData) {
    const data = {
      ...eventData,
      createdBy: Number(organizerId),
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      capacity: Number(eventData.capacity),
    };

    return eventRepository.create(data);
  }

  async getEventsForOrganizer(organizerId, status = null) {
    const events = await eventRepository.findAllByOrganizer(organizerId, status);
    
    return Promise.all(
      events.map(async (ev) => {
        const checkedInAttendees = await registrationRepository.countCheckedInByEvent(ev.id);
        const checkedInVolunteers = await volunteerRepository.countCheckedInByEvent(ev.id);
        return {
          ...ev,
          checkedInAttendees,
          checkedInVolunteers,
        };
      })
    );
  }

  async getEventById(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const checkedInAttendees = await registrationRepository.countCheckedInByEvent(eventId);
    const checkedInVolunteers = await volunteerRepository.countCheckedInByEvent(eventId);

    return {
      ...event,
      checkedInAttendees,
      checkedInVolunteers,
    };
  }

  async updateEvent(eventId, organizerId, updateData) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.createdBy !== Number(organizerId)) {
      throw new AppError("You do not have permission to update this event", 403);
    }

    const data = { ...updateData };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);
    if (data.capacity) data.capacity = Number(data.capacity);

    return eventRepository.update(eventId, data);
  }

  async deleteEvent(eventId, organizerId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.createdBy !== Number(organizerId)) {
      throw new AppError("You do not have permission to delete this event", 403);
    }

    return eventRepository.delete(eventId);
  }
}

module.exports = new EventService();
