const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");

// Drag events
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
});

// Click to open file dialog
dropZone.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
});

// Handle file upload
function handleFileUpload(file) {
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
            previewImage.src = reader.result;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);

        // Upload to the server
        const formData = new FormData();
        formData.append("image", file);

        fetch("/upload-image", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Image uploaded successfully:", data);
                alert("Image uploaded successfully!");
            })
            .catch((err) => {
                console.error("Error uploading image:", err);
                alert("Failed to upload image.");
            });
    } else {
        alert("Please upload a valid image file.");
    }
}
