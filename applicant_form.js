import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://lseutvqcfshzryanmblu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZXV0dnFjZnNoenJ5YW5tYmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MjU5MTksImV4cCI6MjA1NjQwMTkxOX0.EH64pyy3rERJIyZLBSAq0b2PhtZFkJyW0FXJ2i4hcow";
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = "GMB_DOCS";
document.addEventListener("DOMContentLoaded", function () {
    // Auto-select current date
    document.getElementById("doa").valueAsDate = new Date();

    // PAN Card Validation: Auto Uppercase & Format Enforcement
    let panCardInput = document.getElementById("pancard");
    let panError = document.createElement("span");
    panError.style.color = "red";
    panError.style.fontSize = "12px";
    panCardInput.parentNode.appendChild(panError);

    panCardInput.addEventListener("input", function () {
        let value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Allow A-Z, 0-9 only
        let formattedValue = value.slice(0, 5).replace(/[^A-Z]/g, '') +
                             value.slice(5, 9).replace(/[^0-9]/g, '') +
                             value.slice(9, 10).replace(/[^A-Z]/g, '');
        this.value = formattedValue;
        panError.textContent = ""; // Clear error when typing
    });

    panCardInput.addEventListener("blur", function () {
        let panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panPattern.test(this.value)) {
            panError.textContent = "Invalid PAN format (Example: ABCDE1234F)";
        } else {
            panError.textContent = ""; // Clear error if valid
        }
    });

    // Toggle "Other" Purpose Field
    document.getElementById("purpose").addEventListener("change", function () {
        let otherPurposeField = document.getElementById("otherPurposeField");
        let otherPurposeInput = document.getElementById("otherPurpose");

        if (this.value === "other") {
            otherPurposeField.style.display = "block"; // Show text box
            otherPurposeInput.setAttribute("required", "true"); // Make it required
        } else {
            otherPurposeField.style.display = "none"; // Hide text box
            otherPurposeInput.removeAttribute("required"); // Remove required attribute
        }
     });

    // PDF Validation: Restrict to .pdf and ≤ 300KB
    document.querySelectorAll("input[type='file']").forEach(fileInput => {
        let fileError = document.createElement("span");
        fileError.style.color = "red";
        fileInput.parentNode.appendChild(fileError);

        fileInput.addEventListener("change", function () {
            let file = this.files[0];
            fileError.textContent = ""; // Clear previous error

            if (file) {
                let isPDF = file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf");
                let isValidSize = file.size <= 300 * 1024; // 300KB max

                if (!isPDF) {
                    fileError.textContent = "Only PDF files are allowed.";
                    this.value = "";
                } else if (!isValidSize) {
                    fileError.textContent = "File size exceeds 300KB. Please upload a smaller file.";
                    this.value = "";
                }
            }
        });
    });

  // Function to Upload Files to Supabase Storage
async function uploadFile(file) {
    if (!file) return null;
    
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`uploads/${fileName}`, file, {
            contentType: file.type,
            upsert: true
        });

    if (error) {
        console.error("File Upload Error:", error.message);
        return null;
    }

    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/uploads/${fileName}`;
}

// Form Submission
document.getElementById("applicationForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    let submitButton = document.getElementById("btn");
    submitButton.disabled = true; // Disable button to prevent multiple clicks
    submitButton.textContent = "Submitting...";

    let fileInputs = document.querySelectorAll("input[type='file']");
    let uploadedFiles = [];

    // Upload each file and store URLs in JSON format
    for (let fileInput of fileInputs) {
        let file = fileInput.files[0];
        if (file) {
            let fileUrl = await uploadFile(file);
            if (fileUrl) {
                uploadedFiles.push({
                    file_url: fileUrl,
                    file_name: file.name,
                    file_type: fileInput.name // Assuming the input name corresponds to the file type (e.g., project_report, source_income, etc.)
                });
            }
        }
    }

    // Get authenticated user
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        alert("User not authenticated. Please log in.");
        console.error("Auth Error:", userError);
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        return;
    }

    // Collect Form Data
    const formData = {
        user_id: user.id, // 🔑 This is critical
        date_of_application: document.getElementById("doa").value,
        company_name: document.getElementById("company").value,
        plot_number: document.getElementById("plot").value,
        lease_period: parseInt(document.getElementById("lease").value, 10),
        pan_card: document.getElementById("pancard").value,
        pld_account: document.getElementById("pld").value,
        purpose: document.getElementById("purpose").value,
        custom_purpose: document.getElementById("otherPurpose").value || null,
        documents: uploadedFiles, // File URLs in the required JSON structure
        created_at: new Date().toISOString()
    };

    // Insert into Supabase `applications` Table
    const { error } = await supabase.from("applications").insert([formData]);

    if (error) {
        console.error("Form Submission Error:", error.message);
        alert("Error submitting form. Please try again.");
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        return;
    }

    alert("Submitted successfully!");
    submitButton.textContent = "Submitted!";
    setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        document.getElementById("applicationForm").reset();
    }, 2000);
});

});