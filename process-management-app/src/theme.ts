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
      },
      typography: {
        allVariants: {
          fontFamily: "'Montserrat', sans-serif",
          textTransform: "none",
        }
      }
})

export default theme;