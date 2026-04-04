import { useState, useEffect } from 'react';
import { Concern, Comment, Notification, ConcernStatus, User } from '../types';
import { mockConcerns, mockNotifications } from '../data/mockData';

export function useConcerns(currentUser: User | null) {
  const [concerns, setConcerns] = useState<Concern[]>(mockConcerns);
  const [notifications, setNotifications] =
  useState<Notification[]>(mockNotifications);

  // Filter notifications for current user
  const userNotifications = currentUser ?
  notifications.filter((n) => n.userId === currentUser.id) :
  [];

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const submitConcern = async (concernData: Partial<Concern>) => {
    if (!currentUser) return null;

    const newConcern: Concern = {
      id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
      title: concernData.title || 'Untitled Concern',
      description: concernData.description || '',
      category: concernData.category || 'General',
      subcategory: concernData.subcategory || 'General',
      status: 'pending',
      priority: concernData.priority || 'medium',
      studentId: currentUser.id,
      studentName: currentUser.name,
      department: concernData.department || 'Administration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: concernData.formData,
      comments: []
    };

    setConcerns((prev) => [newConcern, ...prev]);

    // Create notification for student
    addNotification({
      userId: currentUser.id,
      title: 'Concern Submitted',
      message: `Your concern "${newConcern.title}" has been routed to ${newConcern.department}.`,
      type: 'system',
      concernId: newConcern.id
    });

    return newConcern;
  };

  const updateStatus = (concernId: string, newStatus: ConcernStatus) => {
    setConcerns((prev) =>
    prev.map((c) => {
      if (c.id === concernId) {
        const updated = {
          ...c,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };

        // Notify student
        addNotification({
          userId: c.studentId,
          title: 'Status Updated',
          message: `Your concern "${c.title}" is now ${newStatus.replace('-', ' ')}.`,
          type: 'status_change',
          concernId: c.id
        });

        return updated;
      }
      return c;
    })
    );
  };

  const addComment = (concernId: string, content: string, author: User) => {
    const newComment: Comment = {
      id: `cm-${Date.now()}`,
      author: author.name,
      authorRole: author.role,
      content,
      createdAt: new Date().toISOString(),
      visibleTo: ['student', 'staff', 'admin']
    };

    setConcerns((prev) =>
    prev.map((c) => {
      if (c.id === concernId) {
        // Notify the other party
        const notifyUserId =
        author.role === 'student' ? c.assignedTo : c.studentId;
        if (notifyUserId) {
          addNotification({
            userId: notifyUserId,
            title: 'New Comment',
            message: `${author.name} commented on "${c.title}".`,
            type: 'comment',
            concernId: c.id
          });
        }

        return {
          ...c,
          comments: [...c.comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    })
    );
  };

  const forwardConcern = (concernId: string, newDepartment: string) => {
    setConcerns((prev) =>
    prev.map((c) => {
      if (c.id === concernId) {
        addNotification({
          userId: c.studentId,
          title: 'Concern Forwarded',
          message: `Your concern has been forwarded to ${newDepartment}.`,
          type: 'system',
          concernId: c.id
        });

        return {
          ...c,
          department: newDepartment,
          assignedTo: undefined, // Clear assignment when forwarded
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    })
    );
  };

  const addNotification = (
  notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) =>
  {
    const newNotif: Notification = {
      ...notif,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
    prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
    prev.map((n) => n.userId === currentUser.id ? { ...n, read: true } : n)
    );
  };

  // Helper filters
  const getByStudent = (studentId: string) =>
  concerns.filter((c) => c.studentId === studentId);
  const getByDepartment = (dept: string) =>
  concerns.filter((c) => c.department === dept);
  const getAssignedTo = (staffId: string) =>
  concerns.filter((c) => c.assignedTo === staffId);

  // Stats
  const stats = {
    total: concerns.length,
    pending: concerns.filter((c) => c.status === 'pending').length,
    inProgress: concerns.filter((c) => c.status === 'in-progress').length,
    resolved: concerns.filter((c) => c.status === 'resolved').length,
    rejected: concerns.filter((c) => c.status === 'rejected').length
  };

  return {
    concerns,
    notifications: userNotifications,
    unreadCount,
    submitConcern,
    updateStatus,
    addComment,
    forwardConcern,
    markNotificationRead,
    markAllNotificationsRead,
    getByStudent,
    getByDepartment,
    getAssignedTo,
    stats
  };
}