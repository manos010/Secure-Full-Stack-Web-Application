window.addEventListener("DOMContentLoaded", () => {
  loadBookings();

});


function loadBookings(){
    const upcomingContainer = document.getElementById("upcomingBookings");
  const pastContainer = document.getElementById("pastBookings");

  upcomingContainer.innerHTML = "";
  pastContainer.innerHTML = "";
    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
       if (xhr.status === 200) {
            const bookings = JSON.parse(xhr.responseText);
            console.log(bookings);
            const now = new Date();

            if (bookings.length === 0) {
                upcomingContainer.innerHTML = `<p class="empty-msg">No bookings found</p>`;
                return;
            }

            bookings.forEach(b => {
                const eventDate = new Date(b.event_datetime);
                /*const card = getBandName(b, b.band_id);*/
                const card = createBookingDiv(b);
                

                if (eventDate >= now) {
                    upcomingContainer.appendChild(card);
                } else {
                    if (b.status === "to be done") {
                        updateBookings(b.private_event_id, "done");
                        //b.status = "done";
                    } else if (b.status === "pending" || b.status === "rejected") {
                        updateBookings(b.private_event_id, "rejected");
                        //b.status = "rejected";
                    }
                    pastContainer.appendChild(card);
                }

                if (b.status === "to be done") {
                    const chatBtn = document.createElement("button");
                    chatBtn.textContent = "Open Chat";
                    chatBtn.className = "chat-btn";

                    chatBtn.onclick = () => openChatSPA(b.private_event_id, b.band_name, false); // isBand = false

                    card.appendChild(chatBtn);
                }
            });

            if (!upcomingContainer.hasChildNodes()) {
                upcomingContainer.innerHTML = `<p class="empty-msg">No upcoming bookings</p>`;
            }

            if (!pastContainer.hasChildNodes()) {
                pastContainer.innerHTML = `<p class="empty-msg">No past bookings</p>`;
            }
        }
    };



    xhr.open("GET", "/user/privateEvents");
    xhr.send();


}




function createBookingDiv(b) {
    const card = document.createElement("div");
    card.className = "booking-card";

    
    card.innerHTML = `
        <span><b>Band:</b> ${b.band_id}</span>
        <span><b>Date:</b> ${formatDate(b.event_datetime)}</span> 
        <span><b>Type:</b> ${b.event_type}</span>
        <span><b>City:</b> ${b.event_city}</span>
        <span><b>Price:</b> €${b.price}</span>
        <span class="booking-status status-${b.status}">
            <b>Status:</b> ${b.status}
        </span>
        <span style="grid-column: 1 / -1;">
            <b>Band message:</b> ${b.band_decision || "-"}
        </span>
    `;

   
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status === 200) {
            
                const data = JSON.parse(xhr.responseText);
                const bandName = data.band_name || "Unknown band";

                const bandSpan = card.querySelector("span");
                if (bandSpan) {
                    bandSpan.innerHTML = `<b>Band:</b> ${bandName}`;
                }
            
        } else {
            console.error("Failed to fetch band name for id:", b.band_id);
        }
    };
    
   
    xhr.open("GET", `/bands/${b.band_id}/name`);
    xhr.send();

    return card;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("el-GR");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("el-GR");
}


function updateBookings(privateEventId, status){
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Booking status updated to:", status);
            
            
        } else {
            console.error("Failed to update booking status", xhr.responseText);
        }
    };
    
   
    xhr.open("PUT", `/user/privateEvents/${privateEventId}/status`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        status: status
    }));

    
}



function backToBookings() {
  document.getElementById("chat-page").style.display = "none";
  document.getElementById("bookings-page").style.display = "block";
}