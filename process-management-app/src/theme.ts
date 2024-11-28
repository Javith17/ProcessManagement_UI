import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
          main: '#bb0037',
        },
        secondary: {
          main: '#3c9e09',
        },
      },
      components:{
        MuiButton: {
          defaultProps:{
            disableRipple: false,
            color: 'secondary'
          }
        }
      }
})

export default theme;