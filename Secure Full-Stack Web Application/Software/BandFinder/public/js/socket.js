let socket; 

function openChatSPA(bookingId, bandName, isBand) {
    if (isBand){
        document.getElementById("band-profile").style.display = "none";
    } else {
        document.getElementById("bookings-page").style.display = "none";
    }

    const chatPage = document.getElementById("chat-page");
    chatPage.style.display = "block";
     chatPage.style.backgroundColor = "#ffffff";   
    chatPage.style.color = "#000000";  
    document.getElementById("chat-title").textContent = `Chat`;

    document.getElementById("chat-title").style.color = "#000000";

    const chatContainer = document.getElementById("chat-messages");
    chatContainer.style.backgroundColor = "#ffffff";
    chatContainer.style.color = "#000000";

    const chatInput = document.getElementById("chat-input");
    chatInput.style.backgroundColor = "#ffffff";
    chatInput.style.color = "#000000";
    chatInput.style.border = "1px solid #000";

    const chatForm = document.getElementById("chat-form");
    chatForm.style.color = "#000000";


    const sender = isBand ? "Band" : "User";
    initChatSocket({ bookingId, sender, isBand });
}

function initChatSocket({ bookingId, sender, isBand }) {
    if (socket) socket.disconnect();
    socket = io();

    const room = bookingId; 

    
    socket.emit("joinRoom", { room, sender });

    
    socket.on("chat history", (history) => {
        const container = document.getElementById("chat-messages");
        container.innerHTML = ""; 
        history.forEach(addMessage); 
    });

    //before bonus-llm hatespeech
    /*socket.on("message", addMessage);*/
    
    //after bonus-llm hatespeech
    
    socket.on("message", (msg) => {
    checkHateSpeechAndAdd(msg.text, () => {
        addMessage(msg); 
    });
});

   


    const form = document.getElementById("chat-form");
    form.onsubmit = e => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const text = input.value.trim();
        if (!text) return;

        checkHateSpeechAndAdd(text, () => {
        socket.emit("chatMessage", {
            room,
            private_event_id: bookingId,
            message: text,
            sender,
            recipient: isBand ? "user" : "band"
        });
        input.value = '';
        });
    };

}



function addMessage({ sender, text, timestamp }) {
    const container = document.getElementById("chat-messages");

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender.toLowerCase()}`; // user/banda

    const timeStr = new Date(timestamp).toLocaleTimeString("el-GR");

    msgDiv.innerHTML = `
        <div class="message-text">${text}</div>
        <div class="message-time">${timeStr}</div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function checkHateSpeechAndAdd(msg, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            console.log(result.isHate)

            if (result.isHate) {
                alert("Hate speech detected. Message was blocked.");
                return; 
            }
            callback();
           
            

            
        }
    };

    xhr.open("POST", "/hateCheck");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ text: msg }));
}