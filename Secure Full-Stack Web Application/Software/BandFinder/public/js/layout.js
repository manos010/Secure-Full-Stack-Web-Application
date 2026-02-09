//footer

document.addEventListener("DOMContentLoaded", () => {
    fetch("/footer.html")
        .then(res => res.text())
        .then(html => {
            const footerContainer = document.createElement("div");
            footerContainer.innerHTML = html;
            document.body.appendChild(footerContainer);
        })
        .catch(err => console.error("Failed to load footer", err));
});