import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Badge,
  Tooltip,
  Breadcrumbs,
  Link,
  InputAdornment,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentLate as AssignmentLateIcon,
  Refresh as RefreshIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  Flag as FlagIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

// Status chip component
const StatusChip = ({ status }) => {
  const statusMap = {
    open: { label: 'Open', color: 'error', icon: <AssignmentLateIcon /> },
    'in-progress': { label: 'In Progress', color: 'warning', icon: <RefreshIcon /> },
    resolved: { label: 'Resolved', color: 'success', icon: <CheckCircleIcon /> },
    closed: { label: 'Closed', color: 'default', icon: <AssignmentTurnedInIcon /> },
  };

  const { label, color, icon } = statusMap[status] || { label: status, color: 'default', icon: null };

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      variant="outlined"
      size="small"
      sx={{ minWidth: 110, fontWeight: 500 }}
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
      label={label}
      color={color}
      variant="outlined"
      size="small"
      sx={{ minWidth: 90, fontWeight: 500 }}
    />
  );
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bug-detail-tabpanel-${index}`}
      aria-labelledby={`bug-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Comment component
const Comment = ({ comment, onDelete, onLike, onFlag, isAuthor, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    handleMenuClose();
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    const newReply = {
      id: `reply-${Date.now()}`,
      content: replyText,
      author: {
        id: currentUserId,
        name: 'Current User',
        avatar: null,
      },
      createdAt: new Date().toISOString(),
      likes: [],
    };
    
    setReplies([...replies, newReply]);
    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  const hasLiked = comment.likes?.includes(currentUserId);
  const hasFlagged = comment.flags?.some(f => f.userId === currentUserId);
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Box display="flex" alignItems="flex-start">
        <Avatar
          src={comment.author.avatar}
          alt={comment.author.name}
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          {comment.author.name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight="bold" mr={1}>
              {comment.author.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
            
            <Box flexGrow={1} />
            
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              {isAuthor && (
                <MenuItem onClick={handleDelete}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
              <MenuItem onClick={() => {
                onFlag(comment.id);
                handleMenuClose();
              }}>
                <FlagIcon fontSize="small" sx={{ mr: 1 }} color={hasFlagged ? 'error' : 'inherit'} />
                {hasFlagged ? 'Remove Flag' : 'Flag as Inappropriate'}
              </MenuItem>
            </Menu>
          </Box>
          
          <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {comment.content}
          </Typography>
          
          <Box display="flex" alignItems="center" mt={1}>
            <Tooltip title={hasLiked ? 'Remove like' : 'Like'} arrow>
              <IconButton
                size="small"
                color={hasLiked ? 'primary' : 'default'}
                onClick={() => onLike(comment.id, hasLiked)}
                sx={{ mr: 1 }}
              >
                <ThumbUpIcon fontSize="small" />
                {comment.likes?.length > 0 && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {comment.likes.length}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
            
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => setIsReplying(!isReplying)}
              sx={{ mr: 2 }}
            >
              Reply
            </Button>
            
            {replies.length > 0 && (
              <Button
                size="small"
                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowReplies(!showReplies)}
              >
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </Box>
          
          <Collapse in={isReplying} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
            <form onSubmit={handleReplySubmit}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </Box>
            </form>
          </Collapse>
          
          {replies.length > 0 && (
            <Collapse in={showReplies} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, mt: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                {replies.map((reply) => (
                  <Box key={reply.id} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <Avatar
                        src={reply.author.avatar}
                        alt={reply.author.name}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {reply.author.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold" mr={1}>
                        {reply.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ pl: 4, whiteSpace: 'pre-line' }}>
                      {reply.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// Activity item component
const ActivityItem = ({ activity }) => {
  const getActivityMessage = () => {
    const { type, user, data } = activity;
    const userName = user?.name || 'A user';
    
    switch (type) {
      case 'created':
        return `${userName} created this bug`;
      case 'status':
        return `${userName} changed status from ${data.from} to ${data.to}`;
      case 'assigned':
        return `${userName} assigned this to ${data.to || 'unassigned'}`;
      case 'commented':
        return `${userName} commented`;
      case 'updated':
        return `${userName} updated the ${data.field}`;
      case 'attachment':
        return `${userName} attached a file`;
      default:
        return `${userName} performed an action`;
    }
  };

  return (
    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
      <ListItemAvatar sx={{ minWidth: 40 }}>
        <Avatar
          src={activity.user?.avatar}
          alt={activity.user?.name}
          sx={{ width: 32, height: 32 }}
        >
          {activity.user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={getActivityMessage()}
        secondary={formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        primaryTypographyProps={{ variant: 'body2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
};

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // State
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Check if current user is the author of the bug
  const isAuthor = currentUser && bug && currentUser.id === bug.createdBy.id;
  
  // Fetch bug details
  useEffect(() => {
    const fetchBugDetails = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would make API calls here
        // const [bugRes, commentsRes, activitiesRes] = await Promise.all([
        //   axios.get(`/api/bugs/${id}`),
        //   axios.get(`/api/bugs/${id}/comments`),
        //   axios.get(`/api/bugs/${id}/activities`)
        // ]);
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockBug = {
          id,
          title: 'Login page not loading on mobile',
          description: 'The login page is not loading properly on mobile devices. The form is not centered and the submit button is cut off on smaller screens.',
          status: 'open',
          priority: 'high',
          type: 'bug',
          project: { id: 1, name: 'Website Redesign', key: 'WR' },
          assignee: { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
          createdBy: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          environment: 'Production (v1.2.3)',
          estimatedTime: 4,
          labels: ['mobile', 'ui', 'login'],
          stepsToReproduce: '1. Open the app on a mobile device\n2. Navigate to the login page\n3. Observe the layout issues',
          expectedBehavior: 'The login form should be centered and fully visible on all screen sizes.',
          actualBehavior: 'The form is not centered and the submit button is cut off on smaller screens.',
          attachments: [
            { id: 1, name: 'screenshot.png', size: 1024 * 1024, type: 'image/png', url: '#' },
          ],
        };
        
        const mockComments = [
          {
            id: 'comment-1',
            content: 'I was able to reproduce this issue on my iPhone 12. The login button is partially hidden at the bottom.',
            author: { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            likes: ['user-1'],
            replies: [
              {
                id: 'reply-1',
                content: 'Thanks for confirming, Jane!',
                author: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                likes: [],
              },
            ],
          },
          {
            id: 'comment-2',
            content: 'This seems to be related to the recent CSS changes. I'll look into it.',
            author: { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: null },
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            likes: ['user-1', 'user-2'],
            replies: [],
          },
        ];
        
        const mockActivities = [
          {
            id: 'activity-1',
            type: 'created',
            user: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
            timestamp: mockBug.createdAt,
          },
          {
            id: 'activity-2',
            type: 'assigned',
            user: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            data: { to: 'Jane Smith' },
          },
          {
            id: 'activity-3',
            type: 'status',
            user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
            timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
            data: { from: 'open', to: 'in-progress' },
          },
          {
            id: 'activity-4',
            type: 'commented',
            user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-5',
            type: 'commented',
            user: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-6',
            type: 'commented',
            user: { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: null },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        setBug(mockBug);
        setComments(mockComments);
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching bug details:', error);
        enqueueSnackbar('Failed to load bug details', { variant: 'error' });
        navigate('/bugs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBugDetails();
  }, [id, enqueueSnackbar, navigate]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      content: commentText,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    setShowCommentForm(false);
    
    // Add to activities
    const newActivity = {
      id: `activity-${Date.now()}`,
      type: 'commented',
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      timestamp: new Date().toISOString(),
    };
    
    setActivities([newActivity, ...activities]);
    
    enqueueSnackbar('Comment added successfully', { variant: 'success' });
  };
  
  // Handle comment like
  const handleCommentLike = (commentId, hasLiked) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const likes = [...(comment.likes || [])];
        const userId = currentUser.id;
        
        if (hasLiked) {
          // Remove like
          const likeIndex = likes.indexOf(userId);
          if (likeIndex > -1) {
            likes.splice(likeIndex, 1);
          }
        } else {
          // Add like
          if (!likes.includes(userId)) {
            likes.push(userId);
          }
        }
        
        return { ...comment, likes };
      }
      return comment;
    }));
  };
  
  // Handle comment flag
  const handleCommentFlag = (commentId) => {
    // In a real app, you would make an API call to flag the comment
    enqueueSnackbar('Comment has been flagged for review', { variant: 'info' });
  };
  
  // Handle comment delete
  const handleCommentDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    enqueueSnackbar('Comment deleted', { variant: 'success' });
  };
  
  // Handle bug status change
  const handleStatusChange = (newStatus) => {
    if (!bug) return;
    
    const oldStatus = bug.status;
    setBug({ ...bug, status: newStatus });
    
    // Add to activities
    const newActivity = {
      id: `activity-${Date.now()}`,
      type: 'status',
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      timestamp: new Date().toISOString(),
      data: { from: oldStatus, to: newStatus },
    };
    
    setActivities([newActivity, ...activities]);
    
    // In a real app, you would make an API call to update the status
    enqueueSnackbar(`Status changed to ${newStatus}`, { variant: 'success' });
  };
  
  // Handle bug assignee change
  const handleAssigneeChange = (newAssignee) => {
    if (!bug) return;
    
    const oldAssignee = bug.assignee;
    setBug({ ...bug, assignee: newAssignee });
    
    // Add to activities
    const newActivity = {
      id: `activity-${Date.now()}`,
      type: 'assigned',
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      timestamp: new Date().toISOString(),
      data: { 
        from: oldAssignee ? oldAssignee.name : 'Unassigned',
        to: newAssignee ? newAssignee.name : 'Unassigned',
      },
    };
    
    setActivities([newActivity, ...activities]);
    
    // In a real app, you would make an API call to update the assignee
    enqueueSnackbar(
      newAssignee 
        ? `Assigned to ${newAssignee.name}` 
        : 'Assignee removed',
      { variant: 'success' }
    );
  };
  
  // Handle bug delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      // In a real app, you would make an API call here
      // await axios.delete(`/api/bugs/${id}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      enqueueSnackbar('Bug deleted successfully', { variant: 'success' });
      navigate('/bugs');
    } catch (error) {
      console.error('Error deleting bug:', error);
      enqueueSnackbar('Failed to delete bug', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!bug) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Bug not found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/bugs')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Bugs
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/bugs"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Bugs
        </Link>
        <Typography color="text.primary">
          {bug.project.key}-{bug.id}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ mr: 2, mb: isMobile ? 2 : 0 }}>
          {bug.title}
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1} sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/bugs/${id}/edit`}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          {/* Status and details */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Box>
                    <StatusChip status={bug.status} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Priority
                  </Typography>
                  <Box>
                    <PriorityChip priority={bug.priority} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {bug.type.charAt(0).toUpperCase() + bug.type.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project
                  </Typography>
                  <Typography variant="body2">
                    {bug.project.name} ({bug.project.key})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(bug.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(bug.updatedAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body2">
                    {bug.dueDate ? formatDate(bug.dueDate) : 'No due date'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Environment
                  </Typography>
                  <Typography variant="body2">
                    {bug.environment || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estimated Time
                  </Typography>
                  <Typography variant="body2">
                    {bug.estimatedTime ? `${bug.estimatedTime} hours` : 'Not estimated'}
                  </Typography>
                </Grid>
              </Grid>
              
              {bug.labels && bug.labels.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Labels
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {bug.labels.map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Card elevation={2}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 48,
                },
              }}
            >
              <Tab label="Description" id="tab-0" aria-controls="tabpanel-0" />
              <Tab 
                label={
                  <Box display="flex" alignItems="center">
                    <span>Comments</span>
                    {comments.length > 0 && (
                      <Badge
                        badgeContent={comments.length}
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                } 
                id="tab-1" 
                aria-controls="tabpanel-1" 
              />
              <Tab label="Activity" id="tab-2" aria-controls="tabpanel-2" />
              {bug.attachments && bug.attachments.length > 0 && (
                <Tab 
                  label={
                    <Box display="flex" alignItems="center">
                      <span>Attachments</span>
                      <Badge
                        badgeContent={bug.attachments.length}
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  } 
                  id="tab-3" 
                  aria-controls="tabpanel-3" 
                />
              )}
            </Tabs>
            
            {/* Description tab */}
            <TabPanel value={tabValue} index={0}>
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {bug.description || 'No description provided.'}
                </Typography>
                
                {bug.stepsToReproduce && (
                  <Box mt={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Steps to Reproduce
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {bug.stepsToReproduce}
                    </Typography>
                  </Box>
                )}
                
                {bug.expectedBehavior && (
                  <Box mt={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Expected Behavior
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {bug.expectedBehavior}
                    </Typography>
                  </Box>
                )}
                
                {bug.actualBehavior && (
                  <Box mt={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Actual Behavior
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {bug.actualBehavior}
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
            
            {/* Comments tab */}
            <TabPanel value={tabValue} index={1}>
              {!showCommentForm ? (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCommentForm(true)}
                  sx={{ mb: 2 }}
                >
                  Add Comment
                </Button>
              ) : (
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flexGrow={1}>
                      <form onSubmit={handleCommentSubmit}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoFocus
                          sx={{ mb: 1 }}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Button
                            size="small"
                            onClick={() => setShowCommentForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!commentText.trim()}
                          >
                            Comment
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </Box>
                </Paper>
              )}
              
              {comments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CommentIcon fontSize="large" color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No comments yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Be the first to comment on this bug
                  </Typography>
                  {!showCommentForm && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setShowCommentForm(true)}
                    >
                      Add Comment
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onDelete={handleCommentDelete}
                      onLike={handleCommentLike}
                      onFlag={handleCommentFlag}
                      isAuthor={comment.author.id === currentUser?.id}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                </Box>
              )}
            </TabPanel>
            
            {/* Activity tab */}
            <TabPanel value={tabValue} index={2}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {activities.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" py={4}>
                    No activity yet
                  </Typography>
                ) : (
                  activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                )}
              </List>
            </TabPanel>
            
            {/* Attachments tab */}
            {bug.attachments && bug.attachments.length > 0 && (
              <TabPanel value={tabValue} index={3}>
                <List>
                  {bug.attachments.map((file) => (
                    <ListItem 
                      key={file.id}
                      button
                      component="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AttachFileIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)} • ${file.type}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="download">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                          </svg>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            )}
          </Card>
        </Grid>
        
        {/* Right column */}
        <Grid item xs={12} md={4}>
          {/* Assignee */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardHeader 
              title="Assignee" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              {bug.assignee ? (
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={bug.assignee.avatar} 
                    alt={bug.assignee.name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {bug.assignee.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{bug.assignee.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bug.assignee.email}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
              
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => {
                  // In a real app, you would open a user selection dialog
                  const availableUsers = users.filter(u => u.id !== (bug.assignee?.id || null));
                  if (availableUsers.length > 0) {
                    const newAssignee = bug.assignee ? null : availableUsers[0];
                    handleAssigneeChange(newAssignee);
                  }
                }}
              >
                {bug.assignee ? 'Reassign' : 'Assign to me'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Status Actions */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardHeader 
              title="Status" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1}>
                {statusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant={bug.status === status.value ? 'contained' : 'outlined'}
                    color={bug.status === status.value ? 'primary' : 'inherit'}
                    size="small"
                    startIcon={status.value === 'open' ? <AssignmentLateIcon /> : 
                              status.value === 'in-progress' ? <RefreshIcon /> :
                              status.value === 'resolved' ? <CheckCircleIcon /> :
                              <AssignmentTurnedInIcon />}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={bug.status === status.value}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {status.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
          
          {/* Created By */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardHeader 
              title="Created By" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar 
                  src={bug.createdBy.avatar} 
                  alt={bug.createdBy.name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {bug.createdBy.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1">{bug.createdBy.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bug.createdBy.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          {/* Labels */}
          {bug.labels && bug.labels.length > 0 && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader 
                title="Labels" 
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
              />
              <Divider />
              <CardContent>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {bug.labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Bug #{bug.id}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this bug? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BugDetail;
