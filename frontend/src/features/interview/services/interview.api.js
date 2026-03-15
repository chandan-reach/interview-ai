import axios from 'axios';

const api = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true,
    timeout: 60000, // Increased from 10s to 60s default
    headers: {
        'Content-Type': 'application/json'
    }
})

// Debug interceptor
api.interceptors.request.use(request => {
    console.log('Interview API Request:', request.url);
    return request;
}, error => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    console.log('Interview API Response:', response.status);
    return response;
}, error => {
    if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - Backend server may not be responding');
    } else if (!error.response) {
        console.error('Network Error - Unable to reach backend at http://localhost:3000');
    } else {
        console.error('Response error:', error.response.status);
    }
    return Promise.reject(error);
});

/**
 * @description serrvice to generate interview report based on user self description , resume and Job description
 */
export const generateInterviewReport = async ({jobDescription, resumeFile, selfDescription})=>{
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        headers:{
            "Content-Type":"multipart/form-data"
        },
        timeout: 120000 // 120 seconds for AI processing
    })

    return response.data
}



/**
 * @description  service to get interview report by interviewId
 */

export const getInterviewReportById = async (interview) =>{
    const response = await api.get(`api/interview/report/${interview}`)

    return response.data

}

/**
 * 
 * @description service to get all interview report of logged in user
 */

export const getAllInterviewReport = async  () =>{
    const response = await api.get("/api/interview")

    return response.data
}

/**
 * 
 * @description Service to generate resume pdf based on user self description , resume content and job description 
 */
export const generateResumePdf = async ({interviewReportId}) =>{
   const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
   })
   return response.data
}