// application_status.js
import { getUserId } from "./applicant.js";
import { supabase } from "./config.js";

async function fetchApplications() {
    try {
        const userId = await getUserId();
        if (!userId) {
            console.warn("User not logged in");
            return;
        }

        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;

        const tableBody = document.getElementById("applicationsTable");
        tableBody.innerHTML = ""; // Clear table

        let pendingCount = 0,
            approvedCount = 0,
            rejectedCount = 0;

        data.forEach(app => {
            if (app.status === "pending") pendingCount++;
            if (app.status === "approved") approvedCount++;
            if (app.status === "rejected") rejectedCount++;

            tableBody.innerHTML += `
                <tr>
                    <td>${app.company_name}</td>
                    <td>${app.user_id}</td>
                    <td>${app.plot_number}</td>
                    <td>${app.status}</td>
                    <td>${app.assigned_to}</td>
                    <td>
                        <a href="view_application.html?id=${app.id}" class="text-primary">
    <i class="fa-solid fa-eye fa-lg mx-2 cursor-pointer"></i>
</a>

<a href="edit_application.html?id=${app.id}" class="text-warning">
    <i class="fa-solid fa-user-pen fa-lg mx-2 cursor-pointer"></i>
</a>

<a href="javascript:void(0);" class="text-danger" onclick="deleteApplication('${app.id}')">
    <i class="fa-solid fa-trash fa-lg mx-2 cursor-pointer"></i>
</a>

                    </td>
                </tr>
            `;
        });

        document.getElementById("pendingCount").textContent = pendingCount;
        document.getElementById("approvedCount").textContent = approvedCount;
        document.getElementById("rejectedCount").textContent = rejectedCount;
    } catch (err) {
        console.error("Error fetching applications:", err.message);
    }
}

document.addEventListener("DOMContentLoaded", fetchApplications);


async function deleteApplication(appId) {
    if (!appId) {
        alert("Invalid application ID!");
        return;
    }

    const confirmation = confirm("Are you sure you want to delete this application?");
    if (!confirmation) return;

    try {
        // Delete the application from Supabase
        const { error } = await supabase
            .from("applications") // Change "applications" to your actual table name
            .delete()
            .eq("id", appId);

        if (error) {
            throw new Error(error.message);
        }

        alert("Application deleted successfully!");
        location.reload(); // Refresh the page after deletion
    } catch (err) {
        console.error("Error deleting application:", err);
        alert("Failed to delete the application. Please try again.");
    }
}

window.deleteApplication = deleteApplication;

