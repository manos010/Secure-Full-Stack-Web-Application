window.onload = function() {
  //console.log("DOYLEVEI TO LOAD");
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.readyState === 4 && xhr.status === 200){
            const data = JSON.parse(xhr.responseText);
            if(data.loggedIn){
                // hide login/register
                document.getElementById("user-form").style.display = "none";
                document.getElementById("user-login-form").style.display = "none";
                document.getElementById("welcome_msg").style.display = "none";
                document.getElementById("select_user_or_band").style.display = "none";


                // show profile
                document.getElementById("band-profile").style.display = "block";
            } else {
                // show login/register forms
                document.getElementById("user-form").style.display = "block";
                document.getElementById("user-login-form").style.display = "none";
                document.getElementById("welcome_msg").style.display = "block";

                document.getElementById("band-profile").style.display = "none";
            }
        }
    };
    xhr.open("GET", "/session");
    xhr.send();
};


function show_register_form_band(){
    const bandForm = document.getElementById("band-form");
    const bandLoginForm = document.getElementById("band-login-form");
    
    bandForm.style.display = "block";
    bandLoginForm.style.display = "none";
}



function show_login_form_band(){

    const bandForm = document.getElementById("band-form");
    const bandLoginForm = document.getElementById("band-login-form");

    bandForm.style.display = "none";
    bandLoginForm.style.display = "block";
}

//kanei login
function loginPostBand(){

    //alert("login");
    let form;
    form = document.getElementById("band-login-form");
    let data = displayFormAsJSON(form);
    console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            const responseData = JSON.parse(xhr.responseText);
            console.log(responseData);
            alert("successful login");
          

            //hide old page
            document.getElementById("user-form").style.display = "none";
            document.getElementById("band-form").style.display = "none";
            document.getElementById("user-login-form").style.display = "none";
             document.getElementById("band-login-form").style.display = "none";
            
            document.getElementById("select_user_or_band").style.display = "none";
            document.getElementById("welcome_msg").style.display = "none";

            //show new page
            document.getElementById("band-profile").style.display = "block";


            /*document.getElementById("band-profile").style.background = "linear-gradient(to right, #061161, #780206)";*/
            /*document.getElementById("band-profile").style.background = "white";*/

            

        }
        else if(xhr.status !== 200){
            alert("unsuccessful login");
            //document.getElementById('ajaxContent').innerHTML = 'Request failed. Returned status of' + xhr.status + "<br>";
        }
    };



    xhr.open('POST', '/bandLogin');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
}


function loadPublicEvents() {
    const page = document.getElementById("publicEvent-section-band");
    page.innerHTML = "";

    const upcomingDiv = document.createElement("div");
    upcomingDiv.className = "events-group";

    
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "10px";

    
    const title = document.createElement("h3");
    title.textContent = "Upcoming Events";

    
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.id = "add_more";
    addBtn.onclick = openAddEventModal;

    const addImg = document.createElement("img");
    addImg.src = "plus_icon.svg";
    addImg.alt = "add more";
    addImg.style.width = "30px";
    addImg.style.height = "30px";

    addBtn.style.position = "relative";
    addBtn.style.top = "-6px";  

    addBtn.appendChild(addImg);

    
    header.appendChild(title);
    header.appendChild(addBtn);
    upcomingDiv.appendChild(header);

    const pastDiv = document.createElement("div");
    pastDiv.className = "events-group";
    pastDiv.innerHTML = "<h3>Past Events</h3>";

    page.appendChild(upcomingDiv);
    page.appendChild(pastDiv);

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);
            const now = new Date();

            events.forEach(ev => {
                const evDate = new Date(ev.event_datetime);

                const card = document.createElement("div");
                card.className = "event-card";

                card.innerHTML = `
                    <span><b>Type:</b> ${ev.event_type}</span>
                    <span><b>Description:</b> ${ev.event_description}</span>
                    <span><b>City:</b> ${ev.event_city}</span>
                `;

                // Upcoming
                if (evDate > now) {
                    const btns = document.createElement("div");
                    btns.className = "event-card-actions";

                    const editBtn = document.createElement("button");
                    editBtn.textContent = "Edit";
                    editBtn.onclick = () => openEditEventModal(ev);

                    const delBtn = document.createElement("button");
                    delBtn.textContent = "Delete";
                    delBtn.onclick = () => deletePublicEvent(ev.public_event_id, card);

                    btns.appendChild(editBtn);
                    btns.appendChild(delBtn);
                    card.appendChild(btns);    upcomingDiv.appendChild(card);


                    
                }
                // Past
                else {
                    pastDiv.appendChild(card);
                }
            });
        } else {
            page.innerHTML = "<p>No public events found</p>";
        }
    };

    xhr.open("GET", "/band/publicEvents");
    xhr.send();
}

function deletePublicEvent(event_id, div){
    console.log(event_id);
    if (confirm(`Delete event?`)) {
        const delXhr = new XMLHttpRequest();
        delXhr.onload = function() {
            if (delXhr.readyState === 4 && delXhr.status === 200) {
                //visual remove from screen
                div.remove();
            } else {
                alert("Failed to delete event");
            }
        };
        delXhr.open("DELETE", `/band/publicEvent/${event_id}`);
        
        delXhr.send();
    }
    
    
}
/*
function editPublicEvent(event_id){
    openEditEventModal();
}*/




//create new event
function openAddEventModal() {
  document.getElementById("addEventModal").style.display = "flex";
}

function closeAddEventModal() {
  document.getElementById("addEventModal").style.display = "none";
}

//edit event

function openEditEventModal(ev) {
  const modal = document.getElementById("editEventModal");
  modal.style.display = "flex";


  modal.dataset.eventId = ev.public_event_id;

  
  const form = modal.querySelector("form");

  form.event_type.value = ev.event_type;
  form.event_datetime.value = ev.event_datetime.slice(0,16);
  form.event_description.value = ev.event_description;
  form.participants_price.value = ev.participants_price;
  form.event_city.value = ev.event_city;
  form.event_address.value = ev.event_address;
  form.event_lat.value = ev.event_lat;
  form.event_lon.value = ev.event_lon;
}

function closeEditEventModal() {
  document.getElementById("editEventModal").style.display = "none";
}

//click outside of box, close box
window.onclick = function (event) {
  const modal = document.getElementById("addEventModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};



/*
function submitPublicEvent(event){
    event.preventDefault(); 
    const form = document.getElementById("addEventForm");
    const formData = displayFormAsJSON(form);

  
    console.log(formData);

    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status === 200){
            alert("event added");
            closeAddEventModal();
            loadPublicEvents(); //add new event

        }
        else{
            alert("failed to add event");
        }
    };

    xhr.open("POST", "/band/publicEventsAdd");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(formData);


}*/

//submit new public event to db

/*
function submitPublicEvent(event) {
    event.preventDefault();

    const form = document.getElementById("addEventForm");
    const formDataObj = displayFormAsJSON(form); 
    const data = JSON.parse(formDataObj);
    console.log(data);

    const city = data.event_city;
    const address = data.event_address;

    if (!city || !address) {
        alert("Please fill event city and address");
        return;
    }

    const fullAddress = `${address} ${city} Greece`;

    const geoXhr = new XMLHttpRequest();
    geoXhr.onload = function () {
        if (geoXhr.status !== 200) {
            alert("Geocoding failed");
            return;
        }

        const response = JSON.parse(geoXhr.responseText);

        if (!response || response.length === 0) {
            alert("Location not found");
            return;
        }

        data.event_lat = parseFloat(response[0].lat);
        data.event_lon = parseFloat(response[0].lon);

        sendPublicEventToDB(data);
    };

    const key = "6ae44b8f35msh653c703d82ccc90p1ae04ajsnf99142cffd8e";

    geoXhr.open(
        "GET",
        "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" +
        encodeURIComponent(fullAddress) +
        "&accept-language=en"
    );
    geoXhr.setRequestHeader("x-rapidapi-host", "forward-reverse-geocoding.p.rapidapi.com");
    geoXhr.setRequestHeader("x-rapidapi-key", key);
    geoXhr.send();
}


function sendPublicEventToDB(data) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Event added successfully");
            closeAddEventModal();
            loadPublicEvents();
        } else {
            alert("Failed to add event");
        }
    };

    xhr.open("POST", "/band/publicEventsAdd");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

//edit event to db

function editPublicEvent(event){
    event.preventDefault(); 
    const modal = document.getElementById("editEventModal");
    const event_id = modal.dataset.eventId;
    console.log(event_id);
    const form = document.getElementById("editEventForm");
    const formData = displayFormAsJSON(form);

  
    console.log(formData);

    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status === 200){
            alert("event edited");
            closeEditEventModal();
            loadPublicEvents(); //add new event

        }
        else{
            alert("failed to add event");
        }
    };

    xhr.open("PUT", `/band/publicEvent/${event_id}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(formData);
}
*/



//ta epomena 3 gia api
/*
function getLatLon(city, address, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (!response || response.length === 0) {
                    callback("Location not found");
                    return;
                }
                callback(null, { lat: parseFloat(response[0].lat), lon: parseFloat(response[0].lon) });
            } catch (err) {
                callback("Invalid response from server");
            }
        } else {
            callback("Failed to get location");
        }
    };
    xhr.onerror = function() {
        callback("Network error while getting location");
    }
    xhr.open("POST", "/geocode");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ city, address }));
}*/
/*
function submitPublicEvent(event) {
    event.preventDefault();
    const form = document.getElementById("addEventForm");
    const data = JSON.parse(displayFormAsJSON(form));

    getLatLon(data.event_address, data.event_city, (err, coords) => {
        if (err) return alert(err);
        data.event_lat = coords.lat;
        data.event_lon = coords.lon;
        test gia paradosi?sosto file?
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {
                alert("Event added successfully");
                closeAddEventModal();
                loadPublicEvents();
            } else {
                alert("Failed to add event");
            }
        };
        xhr.open("POST", "/band/publicEventsAdd");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    });
}

// **Edit Public Event**
function editPublicEvent(event){
    event.preventDefault(); 
    const modal = document.getElementById("editEventModal");
    const event_id = modal.dataset.eventId;
    const formData = JSON.parse(displayFormAsJSON(document.getElementById("editEventForm")));

    getLatLon(formData.event_address, formData.event_city, (err, coords) => {
        if (err) return alert(err);
        formData.event_lat = coords.lat;
        formData.event_lon = coords.lon;

        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {
                alert("Event edited successfully");
                closeEditEventModal();
                loadPublicEvents();
            } else {
                alert("Failed to edit event");
            }
        };
        xhr.open("PUT", `/band/publicEvent/${event_id}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(formData));
    });
}*/



function getLatLonFromAddress(city, address) {
    return new Promise((resolve, reject) => {
        if (!city || !address) {
            reject("City or address missing");
            return;
        }

        const fullAddress = `${address} ${city} Greece`;
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
            if (xhr.status !== 200) {
                reject("Geocoding failed");
                return;
            }

            const response = JSON.parse(xhr.responseText);

            if (!response || response.length === 0) {
                reject("Location not found");
                return;
            }

            resolve({
                lat: parseFloat(response[0].lat),
                lon: parseFloat(response[0].lon)
            });
        };

        const key = "6ae44b8f35msh653c703d82ccc90p1ae04ajsnf99142cffd8e";

        xhr.open(
            "GET",
            "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" +
            encodeURIComponent(fullAddress) +
            "&accept-language=en"
        );
        xhr.setRequestHeader("x-rapidapi-host", "forward-reverse-geocoding.p.rapidapi.com");
        xhr.setRequestHeader("x-rapidapi-key", key);
        xhr.send();
    });
}



function submitPublicEvent(event) {
    event.preventDefault();

    const form = document.getElementById("addEventForm");
    const data = JSON.parse(displayFormAsJSON(form));

    getLatLonFromAddress(data.event_city, data.event_address)
  .then(coords => {
      data.event_lat = coords.lat;
      data.event_lon = coords.lon;


            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    alert("Event added");
                    closeAddEventModal();
                    loadPublicEvents();
                } else {
                    alert("Failed to add event");
                }
            };

            xhr.open("POST", "/band/publicEvents");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(data));
        })
        .catch(err => alert(err));
}


function editPublicEvent(event) {
    event.preventDefault();

    const modal = document.getElementById("editEventModal");
    const event_id = modal.dataset.eventId;

    const form = document.getElementById("editEventForm");
    const data = JSON.parse(displayFormAsJSON(form));

    getLatLonFromAddress(data.event_city, data.event_address)
  .then(coords => {
      data.event_lat = coords.lat;
      data.event_lon = coords.lon;


            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    alert("Event edited");
                    closeEditEventModal();
                    loadPublicEvents();
                } else {
                    alert("Failed to edit event");
                }
            };

            xhr.open("PUT", `/band/publicEvent/${event_id}`);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(data));
        })
        .catch(err => alert(err));
}





function loadPrivateEvents() {
    const container = document.getElementById("privateEvent-section-band");
    container.innerHTML = "";

    const pendingDiv = document.createElement("div");
    pendingDiv.className = "events-group";
    pendingDiv.innerHTML = "<h3>Pending Events</h3>";

    const upcomingDiv = document.createElement("div");
    upcomingDiv.className = "events-group";
    upcomingDiv.innerHTML = "<h3>Upcoming Events</h3>";

    const rejectedDiv = document.createElement("div");
    rejectedDiv.className = "events-group";
    rejectedDiv.innerHTML = "<h3>Rejected Events</h3>";

    const pastDiv = document.createElement("div");
    pastDiv.className = "events-group";
    pastDiv.innerHTML = "<h3>Past Events</h3>";

    container.appendChild(pendingDiv);
    container.appendChild(upcomingDiv);
    container.appendChild(rejectedDiv);
    container.appendChild(pastDiv);

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);
            const now = new Date();

            events.forEach(ev => {
                const evDate = new Date(ev.event_datetime);

                const card = document.createElement("div");
                card.className = "event-card";

                card.innerHTML = `
                    <span><b>Type:</b> ${ev.event_type}</span>
                    <span><b>Description:</b> ${ev.event_description}</span>
                    <span><b>City:</b> ${ev.event_city}</span>
                `;

                /*PENDING  */
                if (ev.status === "pending") {
                    const actions = document.createElement("div");
                    actions.className = "event-card-actions";

                    const openBtn = document.createElement("button");
                    openBtn.textContent = "Open";
                    openBtn.onclick = () =>
                        openAcceptPrivateEventModal(ev.private_event_id, card);

                    actions.appendChild(openBtn);
                    card.appendChild(actions);
                    pendingDiv.appendChild(card);
                }

                /* UPCOMING */
                else if (evDate > now && ev.status === "to be done") {
                    const actions = document.createElement("div");
                    actions.className = "event-card-actions";

                    const chatBtn = document.createElement("button");
                    chatBtn.textContent = "Open Chat";
                    chatBtn.onclick = () =>
                        openChatSPA(ev.private_event_id, ev.band_name, true);

                    actions.appendChild(chatBtn);
                    card.appendChild(actions);
                    upcomingDiv.appendChild(card);
                }

                /* PAST */
                else if (evDate <= now && ev.status === "done") {
                    pastDiv.appendChild(card);
                }

                /* REJECTED */
                else if (ev.status === "rejected") {
                    const actions = document.createElement("div");
                    actions.className = "event-card-actions";

                    const delBtn = document.createElement("button");
                    delBtn.textContent = "Delete";
                    delBtn.onclick = () =>
                        deletePrivateEvent(ev.private_event_id, card);

                    actions.appendChild(delBtn);
                    card.appendChild(actions);
                    rejectedDiv.appendChild(card);
                }
            });
        } else {
            container.innerHTML = "<p>No private events found</p>";
        }
    };

    xhr.open("GET", "/band/privateEvents");
    xhr.send();
}


function updatePrivateEventStatus(private_event_id, status, div){
    const msg = document.getElementById("bandDecisionInput").value;
    console.log(msg);    
    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
      if(xhr.readyState === 4 && xhr.status === 200){
            alert(`Event ${status}`);
            div.remove();
            loadPrivateEvents();
            closeAcceptPrivateEventModal();
        } else {
            alert("Failed to update event status");
        }
    };

    xhr.open("PUT", `/band/privateEvents/${private_event_id}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ status: String(status), band_decision: msg}));  
}


function closeAcceptPrivateEventModal(){
    document.getElementById("acceptModal").style.display = "none";
    
}

function openAcceptPrivateEventModal(eventID, div){
    
    document.getElementById("acceptModal").style.display = "flex";
    const rejectBtn = document.getElementById("reject_btn");
    const acceptBtn = document.getElementById("accept_btn");
    rejectBtn.onclick = () => updatePrivateEventStatus(eventID, "rejected", div);
    acceptBtn.onclick = () => updatePrivateEventStatus(eventID, "to be done", div);

}
function MsgForPrivateEvent(event){
    event.preventDefault();
    const form = document.getElementById("editEventForm");
    const formData = displayFormAsJSON(form); 
}

function deletePrivateEvent(private_event_id, div){
    if (!confirm("Are you sure you want to delete this private event?")) return;

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Private event deleted successfully");
            div.remove(); 
        } else {
            alert("Failed to delete private event");
        }
    };

    xhr.open("DELETE", `/band/privateEvents/${private_event_id}`);
    xhr.send();

}

function backToBookings() {
  document.getElementById("chat-page").style.display = "none";
  document.getElementById("band-profile").style.display = "block";
}


//afou exei ginei to login epilegei page metaksi ta diathesima 
function showSectionBand(sectionId) {
    const sections = ['home-section-band', 'profile-section-band', 'externalPublicEvent-id-section-band', 'privateEvent-section-band'];
    sections.forEach(id => {
    document.getElementById(id).style.display = 
        id === sectionId ? 'block' : 'none';
    });
    if(sectionId === "profile-section-band"){
        //console.log("banda profile page");
        showBandInfo();
    }
    else if(sectionId === "externalPublicEvent-id-section-band"){
        loadPublicEvents();
    }
    else if(sectionId === "privateEvent-section-band"){
        loadPrivateEvents();
    }
}

/*
window.addEventListener("DOMContentLoaded", () => {
    checkBandSession();
});*/

function showBandInfo() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.status === 200){
            const bandData = JSON.parse(xhr.responseText);
            const xhrVisits = new XMLHttpRequest();
            xhrVisits.onload = function() {
                let visitData = { registeredVisits: 0, generalVisits: 0 };
                if(xhrVisits.status === 200){
                    visitData = JSON.parse(xhrVisits.responseText);
                }
                populateBandProfileForm(bandData, visitData);
            };
            xhrVisits.open('GET', `/band/${bandData.band_id}/visit`);
            xhrVisits.send();
        }
    };
    xhr.open('GET', '/band/profile');
    xhr.send();
}
/*
function checkBandSession() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);

            if (data.loggedIn) {
                loggedBand = data.band;
                console.log("Logged in band:", loggedBand);
                showBandInfo();
            } else {
                console.log("Visitor mode for band");
            }
        }
    };
    xhr.open("GET", "/session");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}*/

function populateBandProfileForm(bandData, visitData) {
    const container = document.getElementById("profile-section-band");
    container.innerHTML = "";

    const form = document.createElement("form");
    form.id = "band-profile-form";
    form.className = "profile-form";

    form.innerHTML = `
        <h2>Band Profile</h2>
        
        <!-- Analytics inputs -->
        <label>Registered Users Visits</label>
        <input type="text" value="${visitData.registeredVisits || 0}" readonly>

        <label>General Visits</label>
        <input type="text" value="${visitData.generalVisits || 0}" readonly>

        <label>Username</label>
        <input type="text" value="${bandData.username}" readonly>

        <label>Email</label>
        <input type="email" value="${bandData.email}" readonly>

        <label>Password</label>
        <input type="password" name="password" value="${bandData.password}" required>

        <label>Band Name</label>
        <input type="text" name="band_name" value="${bandData.band_name}" required>

        <label>Music Genres</label>
        <input type="text" name="music_genres" value="${bandData.music_genres || ''}" required>

        <label>Band Description</label>
        <textarea name="band_description" rows="4">${bandData.band_description || ''}</textarea>

        <label>Members Number</label>
        <input type="number" name="members_number" value="${bandData.members_number || ''}" min="1" required>

        <label>Founded Year</label>
        <input type="number" name="foundedYear" value="${bandData.foundedYear || ''}" min="1900" max="2026" required>

        <label>Band City</label>
        <input type="text" name="band_city" value="${bandData.band_city || ''}" required>

        <label>Telephone</label>
        <input type="text" name="telephone" value="${bandData.telephone || ''}" required>

        <label>Webpage</label>
        <input type="url" name="webpage" value="${bandData.webpage || ''}">

        <label>Photo URL</label>
        <input type="text" name="photo" value="${bandData.photo || ''}">

        <button type="button" class="save-btn" onclick="saveBandProfile()">Save Changes</button>
    `;

    container.appendChild(form);
}

function saveBandProfile() {
    const form = document.getElementById("band-profile-form");
    const data = {};

    Array.from(form.elements).forEach(el => {
        if (el.name) data[el.name] = el.value;
    });

    fetch("/band/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        alert(resp.message || "Profile updated successfully!");
    })
    .catch(err => alert("Failed to update profile."));
}