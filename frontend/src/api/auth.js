import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
});

// Add a request interceptor to include the JWT in every request
API.interceptors.request.use(
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

export const loginWithWallet = async (wallet, signature) => {
    return await API.post("/users/login", { wallet, signature });
};

export const registerUser = async (userData) => {
    return await API.post("/users/register", userData);
};

export const searchPatients = async (query) => {
    return await API.get(`/users/search?query=${query}`);
};

export const getDoctors = async () => {
    return await API.get("/users/doctors");
};

// Lookup names for multiple wallets
export const lookupWallets = async (wallets) => {
    return await API.post("/users/lookup", { wallets });
};

// Update user profile
export const updateProfile = async (userData) => {
    return await API.put("/users/profile", userData);
};

export default API;
