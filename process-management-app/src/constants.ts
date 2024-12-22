import styled from "@emotion/styled";
import { TableRow } from "@mui/material"
import TablePagination from '@mui/material/TablePagination';
import {
  tablePaginationClasses as classes,
} from '@mui/material/TablePagination';

export const nav_dashboard='dashboard'
export const nav_users='users'
export const nav_roles='roles'
export const nav_vendors='vendor'
export const nav_suppliers='supplier'
export const nav_customers='customer'
export const nav_process='process'
export const nav_parts='parts'
export const nav_boughtouts='boughtouts'
export const nav_machines='machines'
export const nav_subassembly='subAssembly'
export const nav_quotations='quotations'
export const nav_orders='orders'
export const nav_logout='Logout'

export const primaryColor='#bb0037'
export const secondaryColor='#3c9e09'
export const navHoverBackground='#F2F2F2'
export const navIconColor='#626262'
export const navTextColor='#191919'
export const errorTextColor='#d32f2f'

export const TableRowStyled = styled(TableRow)`
  &:nth-of-type(odd) {
    background-color: white;
  }
  &:nth-of-type(even) {
    background-color: #F2F2F2;
  }
`;

export const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  export const CustomTablePagination = styled(TablePagination)`
  & .${classes.toolbar} {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .${classes.selectLabel} {
    margin: 0;
  }

  & .${classes.displayedRows} {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .${classes.spacer} {
    display: none;
  }

  & .${classes.actions} {
    display: flex;
    gap: 0.25rem;
  }
`;

export const page_limit = 10