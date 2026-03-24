// frontend/src/services/userService.ts

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080') + '/api/v1';

export const userService = {
  syncUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Change to 'include' later when cookies are on the same domain
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync user');
      }

      return data;
    } catch (error) {
      console.error('[UserService] Sync Error:', error);
      throw error;
    }
  }
};