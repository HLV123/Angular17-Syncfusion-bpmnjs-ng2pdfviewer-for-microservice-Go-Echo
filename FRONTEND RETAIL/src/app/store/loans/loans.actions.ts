import { createAction, props } from '@ngrx/store';
import { LoanApplication } from '../../core/models/data.models';

export const loadLoans = createAction('[Loan] Load Loans');
export const loadLoansSuccess = createAction(
    '[Loan] Load Loans Success',
    props<{ loans: LoanApplication[] }>()
);
export const loadLoansFailure = createAction(
    '[Loan] Load Loans Failure',
    props<{ error: any }>()
);

export const updateLoanStatus = createAction(
    '[Loan] Update Loan Status',
    props<{ id: string; status: string }>()
);
