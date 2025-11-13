import api from './api';

export const jobService = {
  // Get all jobs
  getAll: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get job by ID
  getById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create new job
  create: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  update: async (id, jobData) => {
    const response = await api.patch(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  delete: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Delete job (alias for delete)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Assign employees to job
  assignEmployees: async (jobId, employeeIds) => {
    const response = await api.post(`/jobs/${jobId}/assign`, { employee_ids: employeeIds });
    return response.data;
  },

  // Unassign employee from job
  unassignEmployee: async (jobId, employeeId) => {
    const response = await api.delete(`/jobs/${jobId}/unassign/${employeeId}`);
    return response.data;
  },

  // Remove employee from job (alias for unassign)
  removeEmployeeFromJob: async (jobId, employeeId) => {
    const response = await api.delete(`/jobs/${jobId}/assign/${employeeId}`);
    return response.data;
  },

  // Finalize job
  finalizeJob: async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/finalize`);
    return response.data;
  },

  // Complete job
  completeJob: async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/complete`);
    return response.data;
  },
};
