import { useState, useEffect } from 'react';
import { User, Role } from '../types';

const INITIAL_USERS = [
{
  id: 'u-admin',
  name: 'System Administrator',
  email: 'admin@nemsu.edu.ph',
  password: 'Admin3msu',
  role: 'admin' as Role,
  department: 'Administration'
}];


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize registered users - always ensure initial accounts exist
    const storedUsers = localStorage.getItem('citezen_registered_users');
    if (!storedUsers) {
      localStorage.setItem(
        'citezen_registered_users',
        JSON.stringify(INITIAL_USERS)
      );
    } else {
      // Ensure admin account exists; remove old pre-seeded staff/student
      try {
        const parsed = JSON.parse(storedUsers);
        const oldPreseeded = ['u-staff', 'u-student'];
        const cleaned = parsed.filter((u: any) => !oldPreseeded.includes(u.id));
        const initialIds = INITIAL_USERS.map((u) => u.id);
        const hasAllInitial = initialIds.every((id) =>
        cleaned.some((u: any) => u.id === id)
        );
        if (!hasAllInitial) {
          const merged = [
          ...INITIAL_USERS,
          ...cleaned.filter((u: any) => !initialIds.includes(u.id))];

          localStorage.setItem(
            'citezen_registered_users',
            JSON.stringify(merged)
          );
        } else if (cleaned.length !== parsed.length) {
          localStorage.setItem(
            'citezen_registered_users',
            JSON.stringify(cleaned)
          );
        }
      } catch {}
    }

    // Check for logged in user
    const storedUser = localStorage.getItem('citezen_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string, role: Role) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storedUsersStr = localStorage.getItem('citezen_registered_users');
    const registeredUsers = storedUsersStr ?
    JSON.parse(storedUsersStr) :
    INITIAL_USERS;

    let foundUser;
    if (role === 'student') {
      foundUser = registeredUsers.find(
        (u: any) => u.studentId === identifier && u.role === role
      );
    } else {
      foundUser = registeredUsers.find(
        (u: any) => u.email === identifier && u.role === role
      );
    }

    if (!foundUser) {
      throw new Error(
        'Invalid credentials. Please check your Student ID/Email and password.'
      );
    }

    if (foundUser.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Remove password before setting user state
    const { password: _, ...userWithoutPassword } = foundUser;

    setUser(userWithoutPassword);
    localStorage.setItem('citezen_user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const register = async (userData: Partial<User> & {password: string;}) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const storedUsersStr = localStorage.getItem('citezen_registered_users');
      const registeredUsers = storedUsersStr ?
      JSON.parse(storedUsersStr) :
      INITIAL_USERS;

      if (userData.role === 'student') {
        const isDuplicate = registeredUsers.some(
          (u: any) => u.studentId === userData.studentId
        );
        if (isDuplicate) {
          throw new Error('An account with this Student ID already exists.');
        }
      } else {
        const isDuplicate = registeredUsers.some(
          (u: any) => u.email === userData.email
        );
        if (isDuplicate) {
          throw new Error('An account with this email already exists.');
        }
      }

      const newUser = {
        id: `u-${Date.now()}`,
        name: userData.name || 'New User',
        email: userData.email || '',
        password: userData.password,
        role: userData.role || 'student',
        studentId: userData.studentId,
        course: userData.course,
        department: userData.department
      };

      const updatedUsers = [...registeredUsers, newUser];
      localStorage.setItem(
        'citezen_registered_users',
        JSON.stringify(updatedUsers)
      );

      // Do not auto-login, just return success so the component can redirect to login
      return true;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('citezen_user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedUser = { ...user, ...updates };

    // Update current session
    setUser(updatedUser);
    localStorage.setItem('citezen_user', JSON.stringify(updatedUser));

    // Update in registered users database
    const storedUsersStr = localStorage.getItem('citezen_registered_users');
    if (storedUsersStr) {
      const registeredUsers = JSON.parse(storedUsersStr);
      const updatedUsers = registeredUsers.map((u: any) =>
      u.id === user.id ? { ...u, ...updates } : u
      );
      localStorage.setItem(
        'citezen_registered_users',
        JSON.stringify(updatedUsers)
      );
    }

    return updatedUser;
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };
}