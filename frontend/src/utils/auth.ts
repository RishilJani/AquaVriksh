// Authentication utility using localStorage

export interface User {
  email: string;
  name: string;
  username?: string;
  isLoggedIn: boolean;
  userId: string | number;
}

// Local storage keys
const USER_STORAGE_KEY = 'aquavriksh_user';

// Get user from localStorage
export const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isLoggedIn) {
        console.log('Auth: Loading user from localStorage:', user);
        return user;
      }
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  return null;
};

// Save user to localStorage
export const saveUser = (user: User): void => {
  try {
    console.log('Auth: Saving user to localStorage:', user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Remove user from localStorage
export const removeUser = (): void => {
  try {
    console.log('Auth: Removing user from localStorage');
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  const user = getUser();
  return user?.isLoggedIn || false;
};

// Get user ID
export const getUserId = (): string | number | null => {
  const user = getUser();
  const userId = user?.userId || null;
  console.log('Auth: getUserId called, returning:', userId, 'for user:', user);
  return userId;
};

// Login user
export const loginUser = (userData: User): void => {
  console.log('Auth: Logging in user:', userData);
  saveUser(userData);
};

// Logout user
export const logoutUser = (): void => {
  console.log('Auth: Logging out user');
  removeUser();
  // Force a page reload to clear any cached state
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Create user data from server response
export const createUserData = (serverData: any, email: string, name?: string): User => {
  return {
    email: email,
    name: name || email.split('@')[0],
    username: serverData.username,
    userId: serverData._id || serverData.userId || serverData.id,
    isLoggedIn: true,
    ...serverData
  };
};

// Check if user is authenticated and redirect if not
export const requireAuth = (): boolean => {
  const user = getUser();
  if (!user || !user.isLoggedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
};
