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
    updatedAt: string;
}

export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IDeleteResponse {
    id: string;
}
