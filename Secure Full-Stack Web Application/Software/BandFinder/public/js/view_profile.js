document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});


function showInfo(){
    console.log("DOYLEVEI SHOW INFO");
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.status === 200){
            const userData = JSON.parse(xhr.responseText);
            populateProfileForm(userData); //efoson pirame piso sosta data, printaroyme user data
        }
    };
    xhr.open('GET', '/user/profile');
    xhr.send();

}

function checkSession() {
    let isLoggedIn = false;
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        if (data.loggedIn) {
            isLoggedIn = true;
            loggedUser = data.user;
            console.log("Logged in user:", loggedUser);

        } else {
            isLoggedIn = false;
            console.log("Visitor mode");
        }
        showInfo(loggedUser);    
    }
    };

    xhr.open("GET", "/session");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}


function populateProfileForm(userData) {
    const container = document.getElementById("profile-container");
    container.innerHTML = ""; 

    const form = document.createElement("form");
    form.id = "profile-form";
    let birthdateValue = userData.birthdate.substring(0, 10);

    form.innerHTML = `
        
        <label>Username</label>
        <input type="text" name="username" value="${userData.username}" readonly>

        <label>Email</label>
        <input type="text" name="email" value="${userData.email}" readonly>

        <label>Password</label>
        <input type="text" name="password" value="${userData.password}" required>

        <label>Firstname</label>
        <input type="text" name="firstname" value="${userData.firstname}" required>

        <label>Lastname</label>
        <input type="text" name="lastname" value="${userData.lastname}" required>
        
        
        <label>Birthdate</label>
        <input type="date" name="birthdate" value="${birthdateValue}" required>

        <label>Gender</label>
        <select name="gender" required>
            <option value="Άντρας" ${userData.gender === "Male" ? "selected" : ""}>Male</option>
            <option value="Γυναίκα" ${userData.gender === "Female" ? "selected" : ""}>Female</option>
            <option value="Άλλο" ${userData.gender === "Other" ? "selected" : ""}>Other</option>
        </select>

        <label>Country</label>
        <input type="text" name="country" value="${userData.country}" required>

        <label>City</label>
        <input type="text" name="city" value="${userData.city}" required>

        <label>Address</label>
        <input type="text" name="address" value="${userData.address}" required>

        <label>Telephone</label>
        <input type="text" name="telephone" value="${userData.telephone}" required>

        <button type="button" onclick="saveProfile()">Save</button>
    `;

    container.appendChild(form);
}

function saveProfile() {
    const form = document.getElementById("profile-form");
    const data = {};

    Array.from(form.elements).forEach(el => {
        if (el.name) data[el.name] = el.value;
    });

    fetch("/user/profile", {
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