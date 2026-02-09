const btnAboutMusic = document.getElementById('btnAboutMusic');
const btnAboutBands = document.getElementById('btnAboutBands');
const inputContainer = document.getElementById('aiInputContainer');
const input = document.getElementById('aiPromptInput');
const btnSend = document.getElementById('sendPromptBtn');
const responseContainer = document.getElementById('aiResponse');

let currentEndpoint = ""; 

btnAboutMusic.addEventListener('click', () => {
    currentEndpoint = '/generate';
    inputContainer.style.display = 'block';
    input.placeholder = "Ask about music...";
    responseContainer.style.display = 'block';
    responseContainer.textContent = "";
    input.value = "";
});

btnAboutBands.addEventListener('click', () => {
    currentEndpoint = '/QueryBands';
    inputContainer.style.display = 'block';
    input.placeholder = "Ask about current bands, events...";
    responseContainer.style.display = 'block';
    responseContainer.textContent = "";
    input.value = "";
});

btnSend.addEventListener('click', async () => {
    const prompt = input.value.trim();
    if (!prompt || !currentEndpoint) return;

    responseContainer.textContent = 'Loading...';

    try {
        const res = await fetch(currentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        


        if(currentEndpoint === '/QueryBands'){
            // SQL query results
            //responseContainer.textContent = JSON.stringify(data, null, 2);
            responseContainer.innerHTML = universalRenderer(data);
        } else {
            // General response
            responseContainer.innerHTML = universalRenderer(data.text) || 'No response';
        }

    } catch (err) {
        console.error(err);
        responseContainer.textContent = 'Error generating response';
    }
});

function universalRenderer(data) {
        //periptosi gia ask about music
      if (typeof data === "string") {
        return `
            <div class="ai-text-response">
                <p>${data.replace(/\n/g, "<br>")}</p>
            </div>
        `;
    }

     //periptosi gia ask about DB
    if (!Array.isArray(data) || data.length === 0) {
        return `<p>No results found.</p>`;
    }

    let html = `<div class="ai-results">`;

    data.forEach((item, index) => {
        html += `<div class="ai-card">`;

         
        const titleKey = Object.keys(item).find(k =>
            k.toLowerCase().includes("name") ||
            k.toLowerCase().includes("title") ||
            k.toLowerCase().includes("type")
        );

        if (titleKey) {
            html += `<h4>${item[titleKey]}</h4>`;
        }

        // all other fields 
        Object.entries(item).forEach(([key, value]) => {
            if (key === titleKey) return;
            if (value === null || value === "") return;
            //source: stackoverflow replace underscores with spaces and capitalize words
            const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, l => l.toUpperCase());

            html += `<p><span class="ai-label">${label}:</span> ${value}</p>`;
        });

        html += `</div>`;
    });

    html += `</div>`;
    return html;
}