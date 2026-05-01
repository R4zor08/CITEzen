import { useState, useEffect, useCallback } from 'react';
import { Concern, ConcernStatus, User } from '../types';
import { apiJson } from '../lib/api';
import { toast } from 'sonner';

export function useConcerns(currentUser: User | null) {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [notifications, setNotifications] = useState<
    import('../types').Notification[]
  >([]);

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const list = await apiJson<import('../types').Notification[]>(
      `/api/notifications?userId=${encodeURIComponent(currentUser.id)}`
    );
    setNotifications(list);
  }, [currentUser]);

  const refreshConcerns = useCallback(async () => {
    if (!currentUser) {
      setConcerns([]);
      return;
    }

    let path: string;
    if (currentUser.role === 'admin') {
      path = '/api/concerns';
    } else if (currentUser.role === 'student') {
      path = `/api/concerns?studentId=${encodeURIComponent(currentUser.id)}`;
    } else {
      const d = currentUser.department?.trim();
      if (!d) {
        setConcerns([]);
        return;
      }
      path = `/api/concerns?department=${encodeURIComponent(d)}`;
    }

    const list = await apiJson<Concern[]>(path);
    setConcerns(list);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setConcerns([]);
      setNotifications([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await Promise.all([refreshConcerns(), refreshNotifications()]);
      } catch (e) {
        if (!cancelled) {
          toast.error(
            e instanceof Error ? e.message : 'Could not load concerns or notifications.'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, refreshConcerns, refreshNotifications]);

  const submitConcern = async (concernData: Partial<Concern>) => {
    if (!currentUser) return null;

    try {
      const created = await apiJson<Concern>('/api/concerns', {
        method: 'POST',
        body: JSON.stringify({
          title: concernData.title,
          description: concernData.description,
          category: concernData.category,
          subcategory: concernData.subcategory,
          priority: concernData.priority,
          studentId: currentUser.id,
          studentName: currentUser.name,
          department: concernData.department,
          formData: concernData.formData,
          attachments: concernData.attachments
        })
      });
      await Promise.all([refreshConcerns(), refreshNotifications()]);
      return created;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit concern');
      throw e;
    }
  };

  const updateStatus = async (concernId: string, newStatus: ConcernStatus) => {
    try {
      await apiJson<Concern>(`/api/concerns/${concernId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      await Promise.all([refreshConcerns(), refreshNotifications()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
      throw e;
    }
  };

  const addComment = async (concernId: string, content: string, author: User) => {
    try {
      await apiJson(`/api/concerns/${concernId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          authorId: author.id,
          visibleTo: ['student', 'staff', 'admin']
        })
      });
      await Promise.all([refreshConcerns(), refreshNotifications()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add comment');
      throw e;
    }
  };

  const forwardConcern = async (concernId: string, newDepartment: string) => {
    try {
      await apiJson<Concern>(`/api/concerns/${concernId}/forward`, {
        method: 'POST',
        body: JSON.stringify({ department: newDepartment })
      });
      await Promise.all([refreshConcerns(), refreshNotifications()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to forward concern');
      throw e;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
      await refreshNotifications();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update notification');
      throw e;
    }
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await apiJson('/api/notifications/mark-all-read', {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id })
      });
      await refreshNotifications();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to mark all read');
      throw e;
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    try {
      await apiJson(
        `/api/notifications?userId=${encodeURIComponent(currentUser.id)}`,
        { method: 'DELETE' }
      );
      await refreshNotifications();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Failed to clear notifications'
      );
      throw e;
    }
  };

  const getByStudent = (studentId: string) =>
    concerns.filter((c) => c.studentId === studentId);
  const getByDepartment = (dept: string) =>
    concerns.filter((c) => c.department === dept);
  const getAssignedTo = (staffId: string) =>
    concerns.filter((c) => c.assignedTo === staffId);

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
    clearAllNotifications,
    getByStudent,
    getByDepartment,
    getAssignedTo,
    stats,
    refreshConcerns,
    refreshNotifications
  };
}
