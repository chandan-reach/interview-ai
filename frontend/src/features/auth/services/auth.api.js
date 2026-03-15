import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// add interceptors for debugging network issues
api.interceptors.request.use(request => {
    console.log('API Request:', request.method, request.url)
    return request
}, error => {
    console.error('Request error:', error)
    return Promise.reject(error)
})

api.interceptors.response.use(response => {
    console.log('API Response:', response.status, response.config.url)
    return response
}, error => {
    if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - backend may be down')
    } else if (!error.response) {
        console.error('Network Error - unable to reach backend')
    } else {
        console.error('Response error:', error.response.status, error.response.data)
    }
    return Promise.reject(error)
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {
        console.error("Error during registration:", err.response ? err.response.data : err.message)
        throw err
    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.error("Error during login:", err.response ? err.response.data : err.message)
        throw err
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.error("Error during logout:", err.response ? err.response.data : err.message)
        throw err
    }
}

export async function getMe() {

    try {
                 
        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.error("Error fetching user:", err.response ? err.response.data : err.message)
        throw err
    }

}