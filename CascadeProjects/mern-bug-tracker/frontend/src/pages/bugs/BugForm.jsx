import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  TextareaAutosize,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

// Mock data for users - in a real app, this would come from an API
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: null },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', avatar: null },
];

// Mock data for projects - in a real app, this would come from an API
const mockProjects = [
  { id: 1, name: 'Website Redesign', key: 'WR' },
  { id: 2, name: 'Mobile App', key: 'MA' },
  { id: 3, name: 'API Development', key: 'API' },
  { id: 4, name: 'Database Migration', key: 'DB' },
];

// Status options
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

// Priority options
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// Type options
const typeOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'task', label: 'Task' },
  { value: 'improvement', label: 'Improvement' },
];

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: Yup.string()
    .required('Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  type: Yup.string().required('Type is required'),
  projectId: Yup.string().required('Project is required'),
  assigneeId: Yup.string().nullable(),
  dueDate: Yup.date().nullable(),
  labels: Yup.array().of(Yup.string().max(20, 'Label must be at most 20 characters')),
  attachments: Yup.array(),
  estimatedTime: Yup.number()
    .min(0, 'Estimated time must be a positive number')
    .nullable(),
  environment: Yup.string().max(100, 'Environment must be at most 100 characters'),
  stepsToReproduce: Yup.string().max(2000, 'Steps to reproduce must be at most 2000 characters'),
  expectedBehavior: Yup.string().max(1000, 'Expected behavior must be at most 1000 characters'),
  actualBehavior: Yup.string().max(1000, 'Actual behavior must be at most 1000 characters'),
});

const BugForm = ({ isEdit = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // State for form
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const [labelError, setLabelError] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(mockProjects);
  
  // Formik initialization
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      type: 'bug',
      projectId: '',
      assigneeId: null,
      dueDate: null,
      labels: [],
      estimatedTime: '',
      environment: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        
        // In a real app, you would make an API call here
        // const endpoint = isEdit ? `/api/bugs/${id}` : '/api/bugs';
        // const method = isEdit ? 'put' : 'post';
        // 
        // const response = await axios[method](endpoint, {
        //   ...values,
        //   attachments,
        // });
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        enqueueSnackbar(
          isEdit ? 'Bug updated successfully!' : 'Bug created successfully!',
          { variant: 'success' }
        );
        
        navigate(isEdit ? `/bugs/${id}` : '/bugs');
      } catch (error) {
        console.error('Error saving bug:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to save bug. Please try again.',
          { variant: 'error' }
        );
      } finally {
        setSaving(false);
      }
    },
  });
  
  // Fetch bug data for editing
  useEffect(() => {
    if (!isEdit) return;
    
    const fetchBug = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would make an API call here
        // const response = await axios.get(`/api/bugs/${id}`);
        // const bug = response.data;
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        const bug = {
          id,
          title: 'Login page not loading on mobile',
          description: 'The login page is not loading properly on mobile devices. The form is not centered and the submit button is cut off on smaller screens.',
          status: 'open',
          priority: 'high',
          type: 'bug',
          projectId: '1',
          assigneeId: '2',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          labels: ['mobile', 'ui', 'login'],
          estimatedTime: 4,
          environment: 'Production (v1.2.3)',
          stepsToReproduce: '1. Open the app on a mobile device\n2. Navigate to the login page\n3. Observe the layout issues',
          expectedBehavior: 'The login form should be centered and fully visible on all screen sizes.',
          actualBehavior: 'The form is not centered and the submit button is cut off on smaller screens.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(),
          createdBy: { id: 1, name: 'John Doe', email: 'john@example.com' },
          updatedBy: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        };
        
        // Set form values
        formik.setValues({
          title: bug.title,
          description: bug.description,
          status: bug.status,
          priority: bug.priority,
          type: bug.type,
          projectId: bug.projectId,
          assigneeId: bug.assigneeId,
          dueDate: bug.dueDate,
          labels: bug.labels || [],
          estimatedTime: bug.estimatedTime,
          environment: bug.environment || '',
          stepsToReproduce: bug.stepsToReproduce || '',
          expectedBehavior: bug.expectedBehavior || '',
          actualBehavior: bug.actualBehavior || '',
        });
        
        // Set attachments (if any)
        setAttachments(bug.attachments || []);
      } catch (error) {
        console.error('Error fetching bug:', error);
        enqueueSnackbar('Failed to load bug. Please try again.', { variant: 'error' });
        navigate('/bugs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBug();
  }, [id, isEdit, enqueueSnackbar, navigate]);
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // In a real app, you would upload files to a server here
    // For now, we'll just add them to the local state
    const newAttachments = files.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file, // Keep the file object for actual upload
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  // Handle file delete
  const handleFileDelete = (fileId) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Handle label add
  const handleAddLabel = () => {
    if (!labelInput.trim()) return;
    
    if (labelInput.length > 20) {
      setLabelError('Label must be at most 20 characters');
      return;
    }
    
    if (formik.values.labels.length >= 5) {
      setLabelError('Maximum 5 labels allowed');
      return;
    }
    
    if (formik.values.labels.includes(labelInput.trim())) {
      setLabelError('Label already exists');
      return;
    }
    
    formik.setFieldValue('labels', [...formik.values.labels, labelInput.trim()]);
    setLabelInput('');
    setLabelError('');
  };
  
  // Handle label delete
  const handleDeleteLabel = (labelToDelete) => {
    formik.setFieldValue(
      'labels',
      formik.values.labels.filter(label => label !== labelToDelete)
    );
  };
  
  // Handle form reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
      formik.resetForm();
      setAttachments([]);
      setLabelInput('');
      setLabelError('');
    }
  };
  
  // Handle delete bug
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bug? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      
      // In a real app, you would make an API call here
      // await axios.delete(`/api/bugs/${id}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      enqueueSnackbar('Bug deleted successfully!', { variant: 'success' });
      navigate('/bugs');
    } catch (error) {
      console.error('Error deleting bug:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete bug. Please try again.',
        { variant: 'error' }
      );
    } finally {
      setDeleting(false);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box mb={3} display="flex" alignItems="center">
          <Button
            component={RouterLink}
            to={isEdit ? `/bugs/${id}` : '/bugs'}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {isEdit ? 'Edit Bug' : 'Create New Bug'}
          </Typography>
          
          {isEdit && (
            <Box ml="auto">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Box>
          )}
        </Box>
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card elevation={2}>
                <CardHeader title="Basic Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="title"
                        name="title"
                        label="Title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="Description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        variant="outlined"
                        multiline
                        rows={4}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                          labelId="status-label"
                          id="status"
                          name="status"
                          value={formik.values.status}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.status && Boolean(formik.errors.status)}
                          label="Status"
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.status && formik.errors.status && (
                          <FormHelperText error>{formik.errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                          labelId="priority-label"
                          id="priority"
                          name="priority"
                          value={formik.values.priority}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.priority && Boolean(formik.errors.priority)}
                          label="Priority"
                        >
                          {priorityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.priority && formik.errors.priority && (
                          <FormHelperText error>{formik.errors.priority}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                          labelId="type-label"
                          id="type"
                          name="type"
                          value={formik.values.type}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.type && Boolean(formik.errors.type)}
                          label="Type"
                        >
                          {typeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.type && formik.errors.type && (
                          <FormHelperText error>{formik.errors.type}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="project-label">Project</InputLabel>
                        <Select
                          labelId="project-label"
                          id="projectId"
                          name="projectId"
                          value={formik.values.projectId}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                          label="Project"
                        >
                          {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                              {project.name} ({project.key})
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.projectId && formik.errors.projectId && (
                          <FormHelperText error>{formik.errors.projectId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="assignee-label">Assignee</InputLabel>
                        <Select
                          labelId="assignee-label"
                          id="assigneeId"
                          name="assigneeId"
                          value={formik.values.assigneeId || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.assigneeId && Boolean(formik.errors.assigneeId)}
                          label="Assignee"
                          renderValue={(selected) => {
                            if (!selected) return 'Unassigned';
                            const user = users.find(u => u.id === selected);
                            return user ? user.name : 'Unknown User';
                          }}
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              <Box display="flex" alignItems="center">
                                {user.avatar ? (
                                  <Avatar src={user.avatar} alt={user.name} sx={{ width: 24, height: 24, mr: 1 }} />
                                ) : (
                                  <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                )}
                                {user.name} ({user.email})
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.assigneeId && formik.errors.assigneeId && (
                          <FormHelperText error>{formik.errors.assigneeId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <DateTimePicker
                        label="Due Date"
                        value={formik.values.dueDate}
                        onChange={(date) => formik.setFieldValue('dueDate', date, true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="outlined"
                            error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                            helperText={formik.touched.dueDate && formik.errors.dueDate}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="environment"
                        name="environment"
                        label="Environment"
                        placeholder="e.g., Production (v1.2.3), Development, Staging"
                        value={formik.values.environment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.environment && Boolean(formik.errors.environment)}
                        helperText={formik.touched.environment && formik.errors.environment}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="estimatedTime"
                        name="estimatedTime"
                        label="Estimated Time (hours)"
                        type="number"
                        value={formik.values.estimatedTime}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.estimatedTime && Boolean(formik.errors.estimatedTime)}
                        helperText={formik.touched.estimatedTime && formik.errors.estimatedTime}
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box mb={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Labels
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                          {formik.values.labels.map((label) => (
                            <Chip
                              key={label}
                              label={label}
                              onDelete={() => handleDeleteLabel(label)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        <Box display="flex" alignItems="center">
                          <TextField
                            size="small"
                            placeholder="Add a label..."
                            value={labelInput}
                            onChange={(e) => {
                              setLabelInput(e.target.value);
                              if (labelError) setLabelError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLabel();
                              }
                            }}
                            error={Boolean(labelError)}
                            helperText={labelError}
                            disabled={formik.values.labels.length >= 5}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddLabel}
                            disabled={!labelInput.trim() || formik.values.labels.length >= 5}
                          >
                            Add
                          </Button>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {formik.values.labels.length}/5 labels added
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Box mt={3}>
                <Card elevation={2}>
                  <CardHeader title="Additional Information" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="stepsToReproduce"
                          name="stepsToReproduce"
                          label="Steps to Reproduce"
                          placeholder="1. First step\n2. Second step\n3. ..."
                          value={formik.values.stepsToReproduce}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.stepsToReproduce && Boolean(formik.errors.stepsToReproduce)}
                          helperText={formik.touched.stepsToReproduce && formik.errors.stepsToReproduce}
                          variant="outlined"
                          multiline
                          rows={4}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="expectedBehavior"
                          name="expectedBehavior"
                          label="Expected Behavior"
                          value={formik.values.expectedBehavior}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.expectedBehavior && Boolean(formik.errors.expectedBehavior)}
                          helperText={formik.touched.expectedBehavior && formik.errors.expectedBehavior}
                          variant="outlined"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="actualBehavior"
                          name="actualBehavior"
                          label="Actual Behavior"
                          value={formik.values.actualBehavior}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.actualBehavior && Boolean(formik.errors.actualBehavior)}
                          helperText={formik.touched.actualBehavior && formik.errors.actualBehavior}
                          variant="outlined"
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardHeader title="Attachments" />
                <Divider />
                <CardContent>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                      fullWidth
                    >
                      Add Files
                    </Button>
                  </label>
                  
                  {attachments.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {attachments.map((file) => (
                          <Box
                            key={file.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              mb: 1,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                            }}
                          >
                            <AttachFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatFileSize(file.size)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDelete(file.id);
                              }}
                              sx={{ ml: 1 }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Box mt={3}>
                <Card elevation={2}>
                  <CardHeader title="Activity" />
                  <Divider />
                  <CardContent>
                    {isEdit ? (
                      <Box>
                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Created by
                          </Typography>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 1,
                                bgcolor: 'primary.main',
                              }}
                            >
                              {currentUser?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {currentUser?.name || 'You'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {format(new Date(), 'MMM d, yyyy h:mm a')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">
                            Last updated
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {format(new Date(), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Activity will appear here once the bug is created.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
              
              <Box mt={3} display="flex" flexDirection="column" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving || !formik.isValid || !formik.dirty}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={() => navigate(isEdit ? `/bugs/${id}` : '/bugs')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  fullWidth
                  onClick={handleReset}
                  disabled={saving || (!formik.dirty && attachments.length === 0)}
                >
                  Reset Form
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default BugForm;
