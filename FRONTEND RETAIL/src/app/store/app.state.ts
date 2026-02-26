import { ActionReducerMap } from '@ngrx/store';
import { notificationsReducer, NotificationsState } from './notifications/notifications.reducer';
import { loansReducer, LoansState } from './loans/loans.reducer';

export interface AppState {
  notifications: NotificationsState;
  loans: LoansState;
}

export const appReducers: ActionReducerMap<AppState> = {
  notifications: notificationsReducer,
  loans: loansReducer
};
