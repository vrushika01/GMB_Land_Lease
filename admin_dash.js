// // Prevent access if not logged in
// document.addEventListener("DOMContentLoaded", function () {
//     if (!localStorage.getItem("userToken")) {
//         alert("Access Denied! Please log in first.");
//         window.location.href = "admin_login.html";
//     }
// });

// // Prevent navigating back to a logged-out session
// window.addEventListener("popstate", function () {
//     if (!localStorage.getItem("userToken")) {
//         window.location.href = "admin_login.html";
//     }
// });

// // Logout Function
// document.getElementById("logoutBtn").addEventListener("click", function () {
//     sessionStorage.clear();
//     localStorage.removeItem("userToken");

//     // Prevent navigating back after logout
//     history.pushState(null, null, "admin_login.html");
//     window.location.href = "admin_login.html";
// });

//admin 
    document.addEventListener("DOMContentLoaded", function () {
        const sidebarLinks = document.querySelectorAll(".nav-link");
        const contentSections = document.querySelectorAll(".content-section");

        sidebarLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault(); // Prevent page reload

                // Get the target content ID
                const targetContent = this.getAttribute("data-content");

                // Hide all sections
                contentSections.forEach(section => {
                    section.style.display = "none";
                });

                // Show the selected section
                const activeSection = document.querySelector(`[data-id="${targetContent}"]`);
                if (activeSection) {
                    activeSection.style.display = "block";
                }
            });
        });
    });

