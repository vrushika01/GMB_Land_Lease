// view_application.js
import { fetchApplicationData, populateForm, displayFiles, displayError } from "./applicant.js";

// Extract application ID from URL
const urlParams = new URLSearchParams(window.location.search);
const applicationId = urlParams.get("id");

if (applicationId) {
    fetchApplicationData(applicationId)
        .then((data) => {
            if (data) {
                populateForm(data);
                displayFiles(data.documents);
            } else {
                displayError("Application not found.");
            }
        })
        .catch(() => displayError("Failed to fetch application data."));
} else {
    displayError("Application ID is missing.");
}

