import { ApiResponse, IEvent, EventsListResponse } from "@/src/types/events";
import { api } from "./axiosInstance";

interface QueryParams {
  search?: string;
  category?: string;
  sortBy?: 'date' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class EventsService {
    async getEvents(params?: QueryParams): Promise<EventsListResponse> {
        const response = await api.get("/events", { params });
        return response.data;
    }

    async getEvent(id: string): Promise<IEvent> {
        const response = await api.get(`/events/${id}`);
        return response.data;
    }

    async getCategories(): Promise<string[]> {
        const response = await api.get("/events/categories");
        return response.data;
    }

    async getSimilarEvents(id: string, limit: number = 4): Promise<IEvent[]> {
        const response = await api.get(`/events/${id}/similar`, { params: { limit } });
        return response.data;
    }

    async createEvent(event: Partial<IEvent>): Promise<ApiResponse<IEvent>> {
        const response = await api.post("/events", event);
        return response.data;
    }

    async updateEvent(id: string, event: Partial<IEvent>): Promise<ApiResponse<IEvent>> {
        const response = await api.patch(`/events/${id}`, event);
        return response.data;
    }

    async deleteEvent(id: string): Promise<ApiResponse<null>> {
        const res = await api.delete(`/events/${id}`);
        return res.data;
    }
}

const eventsService = new EventsService();
export default eventsService;
