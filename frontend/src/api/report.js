import API from "./auth";

export const uploadLabReport = async (formData) => {
    return await API.post("/reports/labUpload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getPatientReports = async (wallet) => {
    return await API.get(`/reports/patient/${wallet}`);
};

export const assignDoctors = async (reportId, doctorWallets) => {
    return await API.post("/reports/assign-doctors", { reportId, doctorWallets });
};

export const getDoctorReports = async (wallet) => {
    return await API.get(`/reports/doctor/${wallet}`);
};

export const addDoctorComment = async (payload) => {
    return await API.post("/reports/add-comment", payload);
};

export const getReportById = async (id) => {
    return await API.get(`/reports/${id}`);
};
