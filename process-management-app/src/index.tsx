import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom' 
import { Provider } from 'react-redux';
import store from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@coreui/coreui/dist/css/coreui.min.css'
import { ThemeOptions } from '@mui/material/styles';
import { ThemeProvider } from '@mui/system';
import theme from './theme'
import { SnackbarProvider } from 'notistack';

// export const themeOptions: ThemeOptions = {
//   palette: {
//     mode: 'light',
//     primary: {
//       main: '#bb0037',
//     },
//     secondary: {
//       main: '#3c9e09',
//     },
//   }
// };

// export const themeOptions: ThemeOptions = {
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#bb0037',
//     },
//     secondary: {
//       main: '#3c9e09',
//     },
//   },
// };

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SnackbarProvider>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </SnackbarProvider>
  </React.StrictMode>
);
