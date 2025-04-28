// applicant.js (Global Reusable Functions)
import { supabase } from "./config.js";

/**
 * Get the currently logged-in user's ID
 * @returns {string|null} User ID or null if not logged in
 */
export async function getUserId() {
    try {
        const { data: user, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.error("Error fetching user:", error?.message || "No user found");
            return null;
        }
        return user.user.id;
    } catch (err) {
        console.error("Unexpected error:", err.message);
        return null;
    }
}

/**
 * Fetch application data by ID
 * @param {string} applicationId - Application ID
 * @returns {Object|null} Application data or null if error
 */
export async function fetchApplicationData(applicationId) {
    try {
        let { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("id", applicationId)
            .single();

        if (error || !data) {
            console.error("Error fetching application:", error?.message || "No data found");
            return null;
        }

        return data;
    } catch (err) {
        console.error("Unexpected error:", err.message);
        return null;
    }
}

/**
 * Populate form fields with application data
 * @param {Object} data - Application data object
 */
export function populateForm(data) {
    const fields = [
        { id: "doa", value: data.doa },
        { id: "company", value: data.company_name },
        { id: "plot", value: data.plot_number },
        { id: "lease", value: data.lease_period },
        { id: "pancard", value: data.pan_card },
        { id: "pld", value: data.pld_account },
        { id: "purpose", value: data.purpose },
    ];

    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || "";
    });

    // Make fields read-only
    document.querySelectorAll("#applicationForm input, #applicationForm select").forEach((el) => {
        el.setAttribute("readonly", true);
        el.setAttribute("disabled", true);
    });

    // Hide Submit Button
    const submitBtn = document.getElementById("btn");
    if (submitBtn) submitBtn.style.display = "none";
}

/**
 * Format file type for better readability
 * @param {string} fileType - Original file type string
 * @returns {string} Formatted file type
 */
export function formatFileType(fileType) {
    return fileType
        ? fileType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
        : "Document Type";
}

/**
 * Display uploaded files in the UI
 * @param {Array} documents - Array of document objects
 */
export function displayFiles(documents) {
    const fileContainer = document.getElementById("fileContainer");
    fileContainer.innerHTML = ""; // Clear existing content

    if (!documents || documents.length === 0) {
        fileContainer.innerHTML = "<p class='text-muted'>No files uploaded for this application.</p>";
        return;
    }

    const row = document.createElement("div");
    row.classList.add("row", "gy-3");

    documents.forEach((doc) => {
        const fileUrl = doc.file_url;
        const fileType = formatFileType(doc.file_type);
        const fileName = doc.file_name || "No file chosen";

        const col = document.createElement("div");
        col.classList.add("col-md-6");

        const label = document.createElement("label");
        label.classList.add("fw-bold", "d-block", "mb-1");
        label.textContent = `${fileType} (PDF, 300KB)`;

        const fileDisplay = document.createElement("div");
        fileDisplay.classList.add("d-flex", "align-items-center", "justify-content-between", "border", "rounded", "p-2", "shadow-sm", "bg-light");

        const fileNameText = document.createElement("span");
        fileNameText.classList.add("text-dark", "fw-medium", "text-truncate");
        fileNameText.style.maxWidth = "70%";
        fileNameText.textContent = fileName;

        const fileLink = document.createElement("a");
        fileLink.href = fileUrl;
        fileLink.target = "_blank";
        fileLink.textContent = "View";
        fileLink.classList.add("btn", "btn-primary", "btn-sm", "px-3", "fw-bold");

        fileDisplay.appendChild(fileNameText);
        fileDisplay.appendChild(fileLink);
        col.appendChild(label);
        col.appendChild(fileDisplay);
        row.appendChild(col);
    });

    fileContainer.appendChild(row);
}

/**
 * Display an error message in the UI
 * @param {string} message - Error message text
 */
export function displayError(message) {
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
        errorContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}

