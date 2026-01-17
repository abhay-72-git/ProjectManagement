import api from './apiConfig';

// Authentication APIs
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    console.log('response',response)
    return response.data;
  },

  register: async (name, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// User Details APIs
export const userDetailsService = {
  // Get all user details (admin view)
  getAll: async () => {
    const response = await api.get('/userdetails/all');
    return response.data;
  },

  // Get current user's details by email (from session)
  getByEmail: async (email) => {
    const response = await api.get(`/userdetails/${email}`);
    return response.data;
  },

  // Create new user details
  create: async (userDetailsData) => {
    const response = await api.post('/userdetails/add-or-update', userDetailsData);
    return response.data;
  },

  // Update user details by email
  updateSelf: async (userDetailsData) => {
    const response = await api.post(`/userdetails/add-or-update`, userDetailsData);
    return response.data;
  },

  delete: async (email) => {
    const response = await api.delete(`/userdetails/${email}`);
    return response.data;
  },

  // Admin update any user
  updateAdmin: async (email, userDetailsData) => {
    return (await api.put(`/userdetails/admin/${email}`, userDetailsData)).data;
  },
};


// Dashboard Statistics API
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/userdetails/all');
    return response.data;
  },
};

// Asset
export const assetService = {
  getAll: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/assets/${id}`);
  }
};

//Velocity
export const sprintVelocityService = {
  getAll: async () => {
    const response = await api.get('/sprintvelocity');
    return response.data;
  },

  // Create new sprint
  create: async (data) => {
    const response = await api.post('/sprintvelocity', data);
    return response.data;
  },

  // Update sprint by id
  update: async (id, data) => {
    const response = await api.put(`/sprintvelocity/${id}`, data);
    return response.data;
  },

  // Delete sprint by id
  delete: async (id) => {
    const response = await api.delete(`/sprintvelocity/${id}`);
    return response.data;
  },
    getStoryPointSummary: async (sprintVelocityId) => {
    const response = await api.get(
      `/sprint-task/sprint/${sprintVelocityId}/story-points`
    );
    return response.data;
  },
}

//sprintTaskService
// Sprint Task
export const sprintTaskService = {
  // Get all sprint tasks
  getAll: async () => {
    const response = await api.get('/sprint-task');
    return response.data;
  },

  // Get sprint task by id
  getById: async (id) => {
    const response = await api.get(`/sprint-task/${id}`);
    return response.data;
  },

  // Create new sprint task
  create: async (data) => {
    const response = await api.post('/sprint-task', data);
    return response.data;
  },

  // Update sprint task by id
  update: async (id, data) => {
    const response = await api.put(`/sprint-task/${id}`, data);
    return response.data;
  },

  // Delete sprint task by id
  delete: async (id) => {
    const response = await api.delete(`/sprint-task/${id}`);
    return response.data;
  },

  // Get sprint dropdown
  getSprints: async () => {
    const response = await api.get('/SprintVelocity/dropdown');
    return response.data;
  },

  // Get sprint start & end dates
  getSprintDates: async (sprintId) => {
    const response = await api.get(`/SprintVelocity/${sprintId}/dates`);
    return response.data;
  },

  // Get users dropdown
  getUsers: async () => {
    const response = await api.get('/UserDetails/dropdown');
    return response.data;
  },
};

//LeaveService
// leavePlanService
export const leavePlanService = {
  getByMonthYear: async (month, year) => {
    const response = await api.get('/LeavePlan', {
      params: { month, year }
    });
    return response.data;
  },

  apply: async (data) => {
    const response = await api.post('/LeavePlan/apply', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/LeavePlan/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/LeavePlan/${id}`);
    return response.data;
  }
};
// ===============================
// Issue Documents API
// ===============================
export const issueDocumentService = {
  getAll: async () => {
    const response = await api.get('/issue-documents');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/issue-documents', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/issue-documents/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/issue-documents/${id}`);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/UserDetails/dropdown');
    return response.data;
  }
};

// ===============================
// Documents API
// ===============================
export const documentService = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  // Get users dropdown
  getUsers: async () => {
    const response = await api.get('/UserDetails/dropdown');
    return response.data;
  },
};

// ===============================
// Lessons Learned API
// ===============================
export const lessonsLearnedService = {
  getAll: async () => {
    const response = await api.get('/lessons-learned');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/lessons-learned', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/lessons-learned/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/lessons-learned/${id}`);
    return response.data;
  }
};


// ===============================
// IS Tickets API
// ===============================
export const isTicketService = {
  getAll: async () => {
    const response = await api.get('/is-tickets');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/is-tickets', data);
    return response.data;
  },

  update: async (ticketId, data) => {
    const response = await api.put(`/is-tickets/${ticketId}`, data);
    return response.data;
  },

  delete: async (ticketId) => {
    const response = await api.delete(`/is-tickets/${ticketId}`);
    return response.data;
  },
  // Get users dropdown
  getUsers: async () => {
    const response = await api.get('/UserDetails/dropdown');
    return response.data;
  },
};
/////////////////////////////////
// ===============================
// Sprint Responsibility API
// ===============================
export const sprintResponsibilityService = {
  // Get all sprint responsibilities
  getAll: async () => {
    const response = await api.get('/sprint-responsibilities');
    return response.data;
  },

  // Create sprint responsibility
  create: async (data) => {
    const response = await api.post('/sprint-responsibilities', data);
    return response.data;
  },

  // Update sprint responsibility
  update: async (id, data) => {
    const response = await api.put(`/sprint-responsibilities/${id}`, data);
    return response.data;
  },

  // Delete sprint responsibility
  delete: async (id) => {
    const response = await api.delete(`/sprint-responsibilities/${id}`);
    return response.data;
  },


  // ===============================
  // Dropdown / Helper APIs
  // ===============================

  // Get sprints dropdown
  getSprints: async () => {
    const response = await api.get('/SprintVelocity/dropdown');
    return response.data;
  },

  // Get sprint start & end dates
  getSprintDates: async (sprintId) => {
    const response = await api.get(`/SprintVelocity/${sprintId}/dates`);
    return response.data;
  },

  // Get users dropdown
  getUsers: async () => {
    const response = await api.get('/UserDetails/dropdown');
    return response.data;
  }
};
export const sprintFeedbackService = {
  // Get all feedbacks
  getAll: async () => {
    const response = await api.get('/SprintMom');
    return response.data;
  },

  // Get feedback by id
  getById: async (id) => {
    const response = await api.get(`/SprintMom/${id}`);
    return response.data;
  },

  // Get feedbacks by month
  getByMonth: async (year, month) => {
    const response = await api.get(`/SprintMom/month/${year}/${month}`);
    return response.data;
  },

  // Create new sprint feedback
  create: async (data) => {
    const response = await api.post('/SprintMom', data);
    return response.data;
  },

  // Update existing sprint feedback
  update: async (id, data) => {
    const response = await api.put(`/SprintMom/${id}`, data);
    return response.data;
  },

  // Delete sprint feedback
  delete: async (id) => {
    const response = await api.delete(`/SprintMom/${id}`);
    return response.data;
  }
};

