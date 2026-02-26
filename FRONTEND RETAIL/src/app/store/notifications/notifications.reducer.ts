import { createReducer, createAction, props, on, createSelector, createFeatureSelector } from '@ngrx/store';
import { Notification } from '../../core/models/data.models';

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = { items: [], unreadCount: 0 };

export const loadNotifications = createAction('[Notifications] Load', props<{ notifications: Notification[] }>());
export const markAsRead = createAction('[Notifications] Mark Read', props<{ id: string }>());

export const notificationsReducer = createReducer(
  initialState,
  on(loadNotifications, (state, { notifications }) => ({
    ...state,
    items: notifications,
    unreadCount: notifications.filter(n => !n.read).length
  })),
  on(markAsRead, (state, { id }) => {
    const items = state.items.map(n => n.id === id ? { ...n, read: true } : n);
    return { ...state, items, unreadCount: items.filter(n => !n.read).length };
  })
);

export const selectNotificationsState = createFeatureSelector<NotificationsState>('notifications');
export const selectNotifications = createSelector(selectNotificationsState, s => s.items);
export const selectUnreadCount = createSelector(selectNotificationsState, s => s.unreadCount);
