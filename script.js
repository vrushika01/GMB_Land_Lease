// Function to show the login form based on user type
function showForm(userType) {
    let loginPage = ""; 
    let registerationpages = "";
  
    // Set different login pages based on the user type
    switch (userType) {
        case 'box1':
            loginPage = "applicant_login.html";
            registerationpages = "registeration.html";
            break;
        case 'box2':
        case 'box3':
        case 'box4':
        case 'box5':
            loginPage = "applicant_login.html";  // Same login page for these officers
            break;
    }
  
    // Redirect to the respective login page
    window.location.href = loginPage;
  }
  
  // Function to load header, footer, or any component dynamically
  async function loadComponent(filePath, elementId) {
      try {
          const response = await fetch(filePath);
          if (!response.ok) {
              throw new Error(`Error loading ${filePath}: ${response.status}`);
          }
          const data = await response.text();
          document.getElementById(elementId).innerHTML = data;
  
          // After loading header, check and attach logout event
          if (elementId === "header") {
              if (shouldShowLogoutButton()) {
                  const optionalButtons = document.getElementById("optional-buttons");
                  if (optionalButtons) optionalButtons.style.display = "block";
  
                  const logoutBtn = document.getElementById("logoutBtn");
                  if (logoutBtn) {
                      logoutBtn.style.display = "block";
  
                      logoutBtn.addEventListener("click", function () {
                          sessionStorage.clear();
                          localStorage.removeItem("userToken");
  
                          // Push new state to prevent back nav
                          history.pushState(null, null, "applicant_login.html");
                          window.location.href = "applicant_login.html";
                      });
                  }
              }
          }
      } catch (error) {
          console.error(error.message);
      }
  }
  
  // Function to determine if logout button should be shown
  function shouldShowLogoutButton() {
      const pageName = window.location.pathname.split('/').pop(); // Get the current file name
      return pageName === "applicant_dash.html" ||
             pageName === "applicant_form.html" ||
             pageName === "admin_dash.html" ||
             pageName === "officer_dash.html" ||
             pageName === "po_dash.html" ||
             pageName === "application_status.html";
  }
  
  // Load header and footer
  loadComponent('header.html', 'header');
  loadComponent('footer.html', 'footer');
  
