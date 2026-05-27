import axios from "axios";

// Setup global Axios Request Interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Setup global Axios Response Interceptor for auto-logout on session expiration (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

const API_URL = "/api/students";

const api = {
  login: async (username, password) => {
    const response = await axios.post("http://localhost:8080/api/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  getStudents: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await axios.post(API_URL, {
      studentName: studentData.studentName,
      subjectName: studentData.subjectName,
      marks: Number(studentData.marks),
    });
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await axios.put(`${API_URL}/${id}`, {
      studentName: studentData.studentName,
      subjectName: studentData.subjectName,
      marks: Number(studentData.marks),
    });
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  getSubjects: async () => {
    const response = await axios.get(`${API_URL}/subjects`);
    return response.data;
  },

  sortBySubjectAsc: async (subject) => {
    const response = await axios.get(
      `${API_URL}/subject/sort/asc?subject=${encodeURIComponent(subject)}`
    );
    return response.data;
  },

  sortBySubjectDesc: async (subject) => {
    const response = await axios.get(
      `${API_URL}/subject/sort/desc?subject=${encodeURIComponent(subject)}`
    );
    return response.data;
  },

  filterByMarks: async (min, max) => {
    const response = await axios.get(`${API_URL}/filter?min=${min}&max=${max}`);
    return response.data;
  },
};

export default api;