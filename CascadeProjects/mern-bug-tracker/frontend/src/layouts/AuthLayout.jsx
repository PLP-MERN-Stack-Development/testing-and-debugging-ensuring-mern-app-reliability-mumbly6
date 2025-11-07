import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            Bug Tracker
          </Typography>
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Outlet />
          </Paper>
        </Box>
        <Box mt={5} textAlign="center">
          <Copyright />
        </Box>
      </Container>
    </Box>
  );
};

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
        Bug Tracker
      </RouterLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default AuthLayout;
