// interfaces/paginated-response.interface.ts
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      limit: number;
      nextCursor?: string;
      prevCursor?: string;
      hasMore: boolean;
    };
  }
  
  // constants.ts
  export const MESSAGE_PAGINATION_LIMIT = 50;