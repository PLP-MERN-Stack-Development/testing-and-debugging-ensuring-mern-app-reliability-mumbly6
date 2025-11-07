import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination, 
  TableSortLabel, 
  TextField, 
  InputAdornment, 
  Menu, 
  MenuItem, 
  IconButton, 
  Chip, 
  Tooltip, 
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme,
  Badge,
  Avatar,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  MoreVert as MoreVertIcon,
  AssignmentLate as AssignmentLateIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  BugReport as BugReportIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { format, parseISO, isAfter, subDays, isWithinInterval } from 'date-fns';
import { visuallyHidden } from '@mui/utils';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Status chip component
const StatusChip = ({ status }) => {
  const statusMap = {
    open: { label: 'Open', color: 'error', icon: <AssignmentLateIcon fontSize="small" /> },
    'in-progress': { label: 'In Progress', color: 'warning', icon: <RefreshIcon fontSize="small" /> },
    resolved: { label: 'Resolved', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    closed: { label: 'Closed', color: 'default', icon: <AssignmentTurnedInIcon fontSize="small" /> },
  };

  const { label, color, icon } = statusMap[status] || { label: status, color: 'default', icon: <BugReportIcon fontSize="small" /> };

  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      color={color}
      variant="outlined"
      sx={{ minWidth: 100 }}
    />
  );
};

// Priority chip component
const PriorityChip = ({ priority }) => {
  const priorityMap = {
    low: { label: 'Low', color: 'info' },
    medium: { label: 'Medium', color: 'primary' },
    high: { label: 'High', color: 'warning' },
    critical: { label: 'Critical', color: 'error' },
  };

  const { label, color } = priorityMap[priority] || { label: priority, color: 'default' };

  return (
    <Chip
      size="small"
      label={label}
      color={color}
      variant="outlined"
      sx={{ minWidth: 90 }}
    />
  );
};

// Date filter options
const dateFilterOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'This Year', value: 'year' },
];

// Status filter options
const statusFilterOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

// Priority filter options
const priorityFilterOptions = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

// Table header cells with sorting
const headCells = [
  { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'priority', numeric: false, disablePadding: false, label: 'Priority' },
  { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created' },
  { id: 'updatedAt', numeric: false, disablePadding: false, label: 'Updated' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
];

const EnhancedTableHead = (props) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.id === 'actions'}
              disabled={headCell.id === 'actions'}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const Bugs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for table data and pagination
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for sorting
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // State for filter menu
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  
  // State for row actions menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch bugs from API
  const fetchBugs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API call here
      // const response = await axios.get('/api/bugs', {
      //   params: {
      //     page: page + 1,
      //     limit: rowsPerPage,
      //     sort: `${order === 'desc' ? '-' : ''}${orderBy}`,
      //     search: searchQuery,
      //     status: statusFilter !== 'all' ? statusFilter : undefined,
      //     priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      //     date: dateFilter !== 'all' ? dateFilter : undefined,
      //   },
      // });
      
      // Mock data for now
      setTimeout(() => {
        const mockBugs = [];
        const statuses = ['open', 'in-progress', 'resolved', 'closed'];
        const priorities = ['low', 'medium', 'high', 'critical'];
        
        for (let i = 1; i <= 25; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];
          const daysAgo = Math.floor(Math.random() * 30);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);
          
          const updatedAt = new Date(createdAt);
          updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * daysAgo));
          
          mockBugs.push({
            id: i,
            title: `Bug #${i}: ${[
              'Login page not loading on mobile',
              'Profile picture upload fails',
              'Incorrect calculation in reports',
              'Button not clickable on Safari',
              'API returns 500 error',
              'Incorrect date formatting',
              'Missing translation strings',
              'Performance issue with large datasets',
              'Incorrect permissions for user role',
              'Broken link in footer',
            ][Math.floor(Math.random() * 10)]}`,
            status,
            priority,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            createdBy: {
              id: 1,
              name: 'John Doe',
              avatar: null,
            },
            assignedTo: Math.random() > 0.3 ? {
              id: 2,
              name: 'Jane Smith',
              avatar: null,
            } : null,
          });
        }
        
        // Apply filters
        let filteredBugs = [...mockBugs];
        
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredBugs = filteredBugs.filter(bug => 
            bug.title.toLowerCase().includes(query) ||
            bug.status.toLowerCase().includes(query) ||
            bug.priority.toLowerCase().includes(query)
          );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filteredBugs = filteredBugs.filter(bug => bug.status === statusFilter);
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
          filteredBugs = filteredBugs.filter(bug => bug.priority === priorityFilter);
        }
        
        // Apply date filter
        const now = new Date();
        if (dateFilter === 'today') {
          filteredBugs = filteredBugs.filter(bug => 
            isAfter(parseISO(bug.createdAt), subDays(now, 1))
          );
        } else if (dateFilter === '7days') {
          filteredBugs = filteredBugs.filter(bug => 
            isAfter(parseISO(bug.createdAt), subDays(now, 7))
          );
        } else if (dateFilter === '30days') {
          filteredBugs = filteredBugs.filter(bug => 
            isAfter(parseISO(bug.createdAt), subDays(now, 30))
          );
        } else if (dateFilter === 'year') {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          filteredBugs = filteredBugs.filter(bug => 
            isWithinInterval(parseISO(bug.createdAt), { start: startOfYear, end: now })
          );
        }
        
        // Apply sorting
        filteredBugs.sort((a, b) => {
          let comparison = 0;
          
          if (orderBy === 'title') {
            comparison = a.title.localeCompare(b.title);
          } else if (orderBy === 'status') {
            comparison = a.status.localeCompare(b.status);
          } else if (orderBy === 'priority') {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          } else if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
            comparison = new Date(a[orderBy]) - new Date(b[orderBy]);
          }
          
          return order === 'desc' ? -comparison : comparison;
        });
        
        // Apply pagination
        const startIndex = page * rowsPerPage;
        const paginatedBugs = filteredBugs.slice(startIndex, startIndex + rowsPerPage);
        
        setBugs(paginatedBugs);
        setTotalCount(filteredBugs.length);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError('Failed to load bugs. Please try again later.');
      setLoading(false);
    }
  }, [page, rowsPerPage, order, orderBy, searchQuery, statusFilter, priorityFilter, dateFilter]);

  // Fetch bugs when component mounts or dependencies change
  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  // Handle sort request
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle filter menu open
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0);
    handleFilterClose();
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    setPage(0);
    handleFilterClose();
  };

  // Handle date filter change
  const handleDateFilterChange = (dateRange) => {
    setDateFilter(dateRange);
    setPage(0);
    handleFilterClose();
  };

  // Handle row actions menu open
  const handleMenuOpen = (event, bug) => {
    setAnchorEl(event.currentTarget);
    setSelectedBug(bug);
  };

  // Handle row actions menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBug(null);
  };

  // Handle edit bug
  const handleEdit = () => {
    if (selectedBug) {
      navigate(`/bugs/${selectedBug.id}/edit`);
    }
    handleMenuClose();
  };

  // Handle view bug
  const handleView = () => {
    if (selectedBug) {
      navigate(`/bugs/${selectedBug.id}`);
    }
    handleMenuClose();
  };

  // Handle delete bug
  const handleDelete = async () => {
    if (!selectedBug) return;
    
    try {
      // In a real app, you would make an API call here
      // await axios.delete(`/api/bugs/${selectedBug.id}`);
      
      // For now, just show a success message and refresh the list
      console.log(`Deleting bug ${selectedBug.id}`);
      fetchBugs();
    } catch (err) {
      console.error('Error deleting bug:', err);
    } finally {
      handleMenuClose();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    return formatDate(dateString);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    return count;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          All Bugs
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

      <Card elevation={2}>
        <CardContent>
          <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
            <TextField
              size="small"
              placeholder="Search bugs..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { minWidth: isMobile ? '100%' : 300 },
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              endIcon={
                getActiveFilterCount() > 0 ? (
                  <Badge
                    badgeContent={getActiveFilterCount()}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                ) : null
              }
              onClick={handleFilterClick}
              sx={{ ml: 'auto' }}
            >
              Filters
            </Button>
            
            <Menu
              anchorEl={filterAnchorEl}
              open={filterOpen}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ p: 2, width: 250 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {statusFilterOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      size="small"
                      variant={statusFilter === option.value ? 'filled' : 'outlined'}
                      color={statusFilter === option.value ? 'primary' : 'default'}
                      onClick={() => handleStatusFilterChange(option.value)}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                  Priority
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {priorityFilterOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      size="small"
                      variant={priorityFilter === option.value ? 'filled' : 'outlined'}
                      color={priorityFilter === option.value ? 'primary' : 'default'}
                      onClick={() => handlePriorityFilterChange(option.value)}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                  Date Range
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dateFilterOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="small"
                      fullWidth
                      variant={dateFilter === option.value ? 'contained' : 'text'}
                      color={dateFilter === option.value ? 'primary' : 'inherit'}
                      onClick={() => handleDateFilterChange(option.value)}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setDateFilter('all');
                      handleFilterClose();
                    }}
                    disabled={getActiveFilterCount() === 0}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Box>
            </Menu>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchBugs}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={fetchBugs} sx={{ mt: 1 }}>Retry</Button>
              </Box>
            ) : bugs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <AssignmentLateIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No bugs found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating a new bug.'}
                </Typography>
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
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={bugs.length}
                  />
                  <TableBody>
                    {bugs.map((bug) => (
                      <TableRow
                        hover
                        key={bug.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                        onClick={() => navigate(`/bugs/${bug.id}`)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ ml: 1 }}>
                              <Typography variant="body2" noWrap>
                                {bug.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" color="textSecondary" noWrap>
                                  #{bug.id} opened {formatRelativeTime(bug.createdAt)} by {bug.createdBy.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={bug.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityChip priority={bug.priority} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formatDate(bug.createdAt)}>
                            <Typography variant="body2">
                              {formatRelativeTime(bug.createdAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formatDate(bug.updatedAt)}>
                            <Typography variant="body2">
                              {formatRelativeTime(bug.updatedAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, bug);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {bugs.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}
          </Paper>
        </CardContent>
      </Card>
      
      {/* Row actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleView}>
          <Box display="flex" alignItems="center">
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            <span>View Details</span>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Box display="flex" alignItems="center">
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            <span>Edit</span>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Box display="flex" alignItems="center">
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            <span>Delete</span>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Bugs;
