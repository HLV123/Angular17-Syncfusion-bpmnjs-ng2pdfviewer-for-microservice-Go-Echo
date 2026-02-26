import { createReducer, on } from '@ngrx/store';
import { LoanApplication } from '../../core/models/data.models';
import * as LoanActions from './loans.actions';

export interface LoansState {
    loans: LoanApplication[];
    loading: boolean;
    error: any;
}

export const initialState: LoansState = {
    loans: [],
    loading: false,
    error: null
};

export const loansReducer = createReducer(
    initialState,
    on(LoanActions.loadLoans, state => ({ ...state, loading: true })),
    on(LoanActions.loadLoansSuccess, (state, { loans }) => ({
        ...state,
        loans,
        loading: false
    })),
    on(LoanActions.loadLoansFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(LoanActions.updateLoanStatus, (state, { id, status }) => ({
        ...state,
        loans: state.loans.map(loan =>
            loan.id === id ? { ...loan, status: status as any } : loan
        )
    }))
);
