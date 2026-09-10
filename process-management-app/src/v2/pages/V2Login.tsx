import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
} from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { login } from "../../slices/authSlice";
import ceLogo from "../../assets/image/ce_logo.png";
import { v2Colors, v2Fonts } from "../theme";

// Functional port of pages/Login.tsx — same fields, same handleLogin (no
// explicit navigate() call here either; V2DefaultLayout handles the redirect
// once auth.userDetail is set, exactly like the original relies on
// DefaultLayout).
const V2Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    await dispatch(login({ emp_code: email, password: password })).unwrap();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: v2Colors.bg, display: "flex", alignItems: "center" }}>
      <Container sx={{ width: "50%" }}>
        <CssBaseline />
        <Card sx={{ borderRadius: "8px" }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <img src={ceLogo} alt="" style={{ width: "180px", height: "180px", marginLeft: "20px", marginRight: "5px" }} />
              <Divider orientation="vertical" variant="middle" flexItem sx={{ mr: "20px" }} />
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
                <Avatar sx={{ m: 1, bgcolor: v2Colors.primary }}>
                  <LockOutlined />
                </Avatar>
                <Typography variant="h5" sx={{ fontFamily: v2Fonts.display }}>Login</Typography>
                <Box sx={{ mt: 1, width: "100%" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Username"
                    name="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleLogin}>
                    Login
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Dialog maxWidth={"md"} open={status === "loading"}>
          <CircularProgress color="success" sx={{ m: 3 }} />
        </Dialog>
      </Container>
    </Box>
  );
};

export default V2Login;
