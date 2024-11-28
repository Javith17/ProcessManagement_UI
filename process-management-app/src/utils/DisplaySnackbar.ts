import { useSnackbar } from "notistack"

export default function DisplaySnackbar(message: any, variant:any, enqueueSnackbar: any) {
    
    enqueueSnackbar(message, { 
        autoHideDuration: 3000,
        anchorOrigin: {
          horizontal: 'center',
          vertical: 'bottom'
        },
        variant: variant
      })
}