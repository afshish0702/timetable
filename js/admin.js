document.addEventListener("DOMContentLoaded", () => {
    const adminBtn = document.querySelector(".top-right");
    const modal = document.getElementById("adminPasswordModal");
    const form = document.getElementById("changePasswordForm");
    const MASTER_PASSWORD = "YOUR_MASTER_PASSWORD"; // replace with your master password

    // Open modal on click
    adminBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Close modal if click outside modal-box
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    // Update password logic
    document.getElementById("updatePasswordBtn").addEventListener("click", async () => {
        const oldPass = document.getElementById("oldPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (!newPass || !confirmPass) {
            showFancyModal("New password cannot be empty!");
            return;
        }

        if (newPass !== confirmPass) {
            showFancyModal("New password and confirm password do not match!");
            return;
        }

        try {
            let res = await fetch("http://localhost:5000/api/admins/get");
            let data = await res.json();
            let currentPassword = data.password;

            if (oldPass === currentPassword || oldPass === MASTER_PASSWORD) {
                // Update in DB
                await fetch("http://localhost:5000/api/admin/update", {
                    method:"PUT",
                    headers: { "Content-Type":"application/json" },
                    body: JSON.stringify({ password: newPass })
                });

                showFancyModal("✅ Password updated successfully!");
                form.reset();
                modal.style.display = "none";
            } else {
                showFancyModal("❌ Old password is incorrect!");
            }
        } catch(err) {
            console.error(err);
            showFancyModal("❌ Error updating password!");
        }
    });

    // Fancy modal
    function showFancyModal(msg) {
        const fancyModal = document.createElement("div");
        fancyModal.style.position = "fixed";
        fancyModal.style.top = "0";
        fancyModal.style.left = "0";
        fancyModal.style.width = "100%";
        fancyModal.style.height = "100%";
        fancyModal.style.display = "flex";
        fancyModal.style.justifyContent = "center";
        fancyModal.style.alignItems = "center";
        fancyModal.style.background = "rgba(0,0,0,0.5)";
        fancyModal.style.zIndex = "3000";

        const box = document.createElement("div");
        box.style.background = "#fff";
        box.style.padding = "20px 25px";
        box.style.borderRadius = "10px";
        box.style.minWidth = "250px";
        box.style.textAlign = "center";
        box.innerHTML = `<p style="margin-bottom:15px;">${msg}</p><button>OK</button>`;

        fancyModal.appendChild(box);
        document.body.appendChild(fancyModal);

        box.querySelector("button").addEventListener("click", () => {
            document.body.removeChild(fancyModal);
        });
    }
});