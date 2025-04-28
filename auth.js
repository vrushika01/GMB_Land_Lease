import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://lseutvqcfshzryanmblu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZXV0dnFjZnNoenJ5YW5tYmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MjU5MTksImV4cCI6MjA1NjQwMTkxOX0.EH64pyy3rERJIyZLBSAq0b2PhtZFkJyW0FXJ2i4hcow";
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Show Alert Function
function showAlert(message) {
    alert(message);
}

// ✅ Signup Function
async function signup(event) {
    event.preventDefault();

    const name = document.getElementById("signup-name")?.value.trim();
    const phone = document.getElementById("signup-phone")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value.trim();
    const role = "applicant"; // Default role

    if (!name || !phone || !email || !password) {
        showAlert("All fields are required!");
        return;
    }

    try {
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (checkError) throw new Error(checkError.message);
        if (existingUser) {
            showAlert("User already registered! Try logging in.");
            return;
        }

        // Create User in Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) throw new Error(error.message);
        if (!data?.user) {
            showAlert("Signup successful! Please log in.");
            return;
        }

        // Store User in Database
        await storeUserInDB(data.user.id, name, phone, email, role);
        showAlert("Signup successful! Please log in.");

        // ✅ Redirect to Login Page
        setTimeout(() => {
            window.location.href = "applicant_login.html";
        }, 2000);

    } catch (err) {
        console.error("Signup Error:", err);
        showAlert("Unexpected error occurred. Try again.");
    }
}

// ✅ Store User in Database
async function storeUserInDB(userId, name, phone, email, role) {
    try {
        const { error } = await supabase
            .from("users")
            .upsert([{ id: userId, name, phone, email, role }]);

        if (error) throw new Error(error.message);
        console.log("User stored successfully:", { id: userId, name, phone, email, role });
    } catch (err) {
        console.error("DB Error:", err);
        showAlert("Unexpected database error.");
    }
}

// ✅ Login Function
async function login(event) {
    event.preventDefault();

    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    if (!email || !password) {
        showAlert("Email and password are required!");
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                showAlert("Incorrect password. Please try again.");
            } else {
                showAlert(error.message);
            }
            throw new Error(error.message);
        }

        if (data?.user) {
             // Store user session token
             localStorage.setItem("userToken", data.session.access_token);
             localStorage.setItem("userId", data.user.id); // Store user ID
            fetchUserRole(data.user.id);
        }
    } catch (err) {
        console.error("Login Error:", err);
    }
}

// ✅ Fetch User Role and Redirect
async function fetchUserRole(userId) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("role,name")
            .eq("id", userId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) {
            showAlert("User role not found. Please try again.");
            return;
        }

        console.log("User role:", data.role);
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("userName", data.name);
        sessionStorage.setItem("userId", userId);

        // ✅ Redirect Based on Role
        switch (data.role) {
            case "admin":
                window.location.href = "admin_dash.html";
                break;
            case "applicant":
                window.location.href = "applicant_dash.html";
                break;
            case "PO":
                window.location.href = "po_dash.html";
                break;
            case "HO":
                window.location.href = "ho_dash.html";
                break;
            case "SE":
                window.location.href = "se_dash.html";
                break;
            case "TO":
                window.location.href = "to_dash.html";
                break;
            default:
                showAlert("Unknown role. Redirecting to homepage.");
                window.location.href = "index.html";
        }

    } catch (err) {
        console.error("Role Fetch Error:", err);
        showAlert("Unexpected error. Try again.");
    }
}

// ✅ Logout Function
// async function logout() {
//     try {
//         await supabase.auth.signOut();

//         // Remove stored session details
//         localStorage.removeItem("userToken");
//         localStorage.removeItem("userId");
//         sessionStorage.removeItem("userRole");
//         sessionStorage.removeItem("userName");
//         sessionStorage.clear(); // Clears all sessionStorage data

//         // Redirect to login page
//         window.location.href = "index.html";
//         showAlert("Logged out successfully!");
//     } catch (err) {
//         console.error("Logout Error:", err);
//         showAlert("Error logging out. Try again.");
//     }
// }
// document.addEventListener("DOMContentLoaded", function () {
//     const logoutBtn = document.getElementById("logoutBtn");

//     if (logoutBtn) {
//         logoutBtn.addEventListener("click", logout);
//     } else {
//         console.error("Logout button not found!");
//     }
// });


// ✅ Restrict Access to Dashboards
document.addEventListener("DOMContentLoaded", () => {
    const userRole = sessionStorage.getItem("userRole");
    const path = window.location.pathname;

    // Redirect users based on role
    if (path.includes("admin_dash.html") && userRole !== "admin") {
        window.location.href = "index.html";
    }
    if (path.includes("applicant_dash.html") && userRole !== "applicant") {
        window.location.href = "index.html";
    }
    if (path.includes("po_dash.html") && userRole !== "PO") {
        window.location.href = "index.html";
    }
    if (path.includes("ho_dash.html") && userRole !== "HO") {
        window.location.href = "index.html";
    }
    if (path.includes("se_dash.html") && userRole !== "SE") {
        window.location.href = "index.html";
    }
    if (path.includes("to_dash.html") && userRole !== "TO") {
        window.location.href = "index.html";
    }
});

// ✅ Forgot Password Function
async function resetPassword(event) {
    event.preventDefault();

    
    const email = document.getElementById("email").value.trim();
    if (!email) return showAlert("Please enter your email.");


// const redirectUrl = `${window.location.origin}/land_tc1/reset-password.html`;
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: redirectUrl
//     });
const currentOrigin = window.location.origin; // Gets current domain dynamically
    const currentPath = window.location.pathname.split('/').slice(0, -1).join('/'); // Gets the current folder path
    
    const redirectUrl = `${currentOrigin}${currentPath}/reset-password.html`;
    
    console.log("Redirect URL:", redirectUrl); // Debugging
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
    });
    showAlert(error ? `Error: ${error.message}` : "Password reset email sent! Check your inbox.");
}

// ✅ Reset Password Function
async function updatePassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById("new-password").value.trim();
    if (!newPassword) return showAlert("Please enter a new password.");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    // showAlert(error ? `Error: ${error.message}` : "Password updated successfully! You can now log in.");
    if (error) {
        alert(`Error: ${error.message}`);
    } else {
        alert("Password updated successfully! You can now log in.");
        window.location.href = "applicant_login.html"; // Redirect to login
    }
}



// ✅ Attach Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-form")?.addEventListener("submit", signup);
    document.getElementById("login-form")?.addEventListener("submit", login);
    document.getElementById("forgot-form")?.addEventListener("submit", resetPassword);
    document.getElementById("update-password-form")?.addEventListener("submit", updatePassword);
});

// ✅ Export Functions for HTML Use
window.signup = signup;
window.login = login;
window.logout = logout;
window.resetPassword = resetPassword;
window.updatePassword = updatePassword;
