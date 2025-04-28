import { supabase } from "./config.js";


document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    fetchAllApplications();
});

async function fetchAllApplications() {
    try {
        console.log("Fetching applications from Supabase...");
        
        // Fetch data from the 'applications' table
        const { data, error } = await supabase
            .from("applications")
            .select("*");
        
        // Log the raw response
        console.log("Supabase Response:", data);
        console.log("Supabase Error:", error);

        if (error) {
            console.error("Error fetching data:", error.message);
            alert(`Error: ${error.message}`);
            return; // Exit the function if there is an error
        }

        if (!data || data.length === 0) {
            console.log("No data found.");
            return; // Exit if no data is found
        }

        // Proceed with rendering the data in the table if connected successfully
        const tableBody = document.getElementById("applicationsTable");
        if (!tableBody) {
            console.error("applicationsTable element not found.");
            return;
        }

        tableBody.innerHTML = ""; // Clear any previous data

        let pendingCount = 0, approvedCount = 0, rejectedCount = 0;

        // Loop through the data to populate the table and counts
        data.forEach(app => {
            if (app.status === "pending") pendingCount++;
            if (app.status === "approved") approvedCount++;
            if (app.status === "rejected") rejectedCount++;

            tableBody.innerHTML += `
                <tr>
                    <td>${app.company_name}</td>
                    <td>${app.plot_number}</td>
                    <td>${app.lease_period || '-'}</td>
                    <td>${app.purpose || '-'}</td>
                    <td>${app.status}</td>
                    <td>${app.date_of_application || '-'}</td>
                    <td>${app.assigned_to || '-'}</td>
                    <td>
                        <a href="view_application.html?id=${app.id}" class="text-primary">
                            <i class="fa-solid fa-eye fa-lg mx-2 cursor-pointer"></i>
                        </a>
                        <a href="assign_po.html?id=${app.id}" class="text-success">
                            <i class="fa-solid fa-user-check fa-lg mx-2 cursor-pointer"></i>
                        </a>
                        <a href="javascript:void(0);" class="text-danger" onclick="deleteApplication('${app.id}')">
                            <i class="fa-solid fa-trash fa-lg mx-2 cursor-pointer"></i>
                        </a>
                    </td>
                </tr>
            `;
        });

        // Update the counts
        document.getElementById("pendingCount").textContent = pendingCount;
        document.getElementById("approvedCount").textContent = approvedCount;
        document.getElementById("rejectedCount").textContent = rejectedCount;

    } catch (err) {
        console.error("Error fetching applications:", err.message);
        alert(`Error: ${err.message}`);
    }
}

async function deleteApplication(appId) {
    const confirmDelete = confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    try {
        const { error } = await supabase
            .from("applications")
            .delete()
            .eq("id", appId);

        if (error) throw error;

        alert("Application deleted successfully.");
        location.reload();
    } catch (err) {
        console.error("Error deleting application:", err.message);
        alert("Failed to delete the application.");
    }
}

// Expose to global scope for inline onclick
window.deleteApplication = deleteApplication;