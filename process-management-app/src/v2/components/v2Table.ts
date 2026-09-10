import styled from "@emotion/styled";
import { TableRow } from "@mui/material";
import { v2Colors, v2Fonts } from "../theme";

// Matches ui-design-concept.html's table.grid tbody tr — flat white rows,
// surface-2 on hover. The design's default grid table is NOT zebra-striped;
// only the separate .flat-striped variant (see V2StripedTableRowStyled below)
// alternates row color.
export const V2TableRowStyled = styled(TableRow)`
  &:hover {
    background-color: ${v2Colors.surface2};
  }
`;

// Matches ui-design-concept.html's table.flat-striped — used for the
// Boughtouts sub-tables under Assembly / Order Detail.
export const V2StripedTableRowStyled = styled(TableRow)`
  &:nth-of-type(even) {
    background-color: ${v2Colors.surface2};
  }
  &:hover {
    background-color: ${v2Colors.infoTint};
  }
`;

// Applied via className/sx to numeric or coded cells (part codes, qty, cost,
// dates) for the tabular-nums "spec sheet" look.
export const v2MonoCellSx = {
  fontFamily: v2Fonts.mono,
  fontVariantNumeric: 'tabular-nums',
};
