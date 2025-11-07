import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  IconButton, 
  LinearProgress,
  Divider,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentLate as AssignmentLateIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Status chip component
const StatusChip = ({ status }) => {
  const statusColors = {
    open: 'error',
    'in-progress': 'warning',
    resolved: 'success',
    closed: 'default',
  };

  const statusIcons = {
    open: <AssignmentLateIcon />,
    'in-progress': <RefreshIcon />,
    resolved: <CheckCircleIcon />,
    closed: <AssignmentTurnedInIcon />,
  };

  return (
    <Chip
      icon={statusIcons[status] || <BugReportIcon />}
      label={status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      color={statusColors[status] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

// Priority chip component
const PriorityChip = ({ priority }) => {
  const priorityColors = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    critical: 'error',
  };

  return (
    <Chip
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      color={priorityColors[priority] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
  });
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this data from your API
        // const [statsRes, bugsRes] = await Promise.all([
        //   axios.get('/api/bugs/stats'),
        //   axios.get('/api/bugs/recent')
        // ]);
        // setStats(statsRes.data);
        // setRecentBugs(bugsRes.data);
        
        // Mock data for now
        setTimeout(() => {
          setStats({
            totalBugs: 24,
            openBugs: 8,
            inProgressBugs: 12,
            resolvedBugs: 4,
          });
          
          setRecentBugs([
            {
              id: 1,
              title: 'Login page not loading on mobile',
              status: 'open',
              priority: 'high',
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: 2,
              title: 'Profile picture upload fails for large files',
              status: 'in-progress',
              priority: 'medium',
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              id: 3,
              title: 'Incorrect calculation in reports',
              status: 'resolved',
              priority: 'critical',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
          
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, loading }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {loading ? '...' : value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: `${color}.100`,
              color: `${color}.600`,
              width: 56,
              height: 56,
            }}
          >
            {React.cloneElement(icon, { fontSize: 'large' })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'Just now';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/bugs/create"
        >
          New Bug
        </Button>
      </Box>

      {loading && <LinearProgress />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bugs"
            value={stats.totalBugs}
            icon={<BugReportIcon />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open"
            value={stats.openBugs}
            icon={<AssignmentLateIcon />}
            color="error"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgressBugs}
            icon={<RefreshIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={stats.resolvedBugs}
            icon={<CheckCircleIcon />}
            color="success"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Recent Bugs */}
      <Card elevation={2}>
        <CardHeader
          title="Recent Bugs"
          action={
            <IconButton aria-label="refresh" onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 800 }}>
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Box p={3} textAlign="center">
                  <CircularProgress />
                </Box>
              ) : recentBugs.length > 0 ? (
                <Box>
                  {recentBugs.map((bug) => (
                    <Box
                      key={bug.id}
                      component={RouterLink}
                      to={`/bugs/${bug.id}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">{bug.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <StatusChip status={bug.status} />
                          <Box mx={1} />
                          <PriorityChip priority={bug.priority} />
                          <Box mx={1}>
                            <Typography variant="caption" color="textSecondary">•</Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {getTimeAgo(bug.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(bug.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box p={3} textAlign="center">
                  <Typography variant="body1" color="textSecondary">
                    No bugs found. Create your first bug to get started!
                  </Typography>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to="/bugs/create"
                      startIcon={<AddIcon />}
                    >
                      Create Bug
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Dashboard;
