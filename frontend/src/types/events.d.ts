export interface IEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    location: string;
    category: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt?: string;
  }

  export type ApiResponse<T> = {
    success: boolean;
    status?: string | null;
    data?: T;
    message?: string;
    errors?: string[];
  };

  export type EventsListResponse = {
    data: IEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  interface IQueryParams {
    search?: string;
    category?: string;
    sortBy?: 'date' | 'title' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }


  interface IMapViewProps {
    events: IEvent[];
    onEventClick: (id: string) => void;
}