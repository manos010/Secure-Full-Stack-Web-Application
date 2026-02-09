function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createTableFromJSON(data) {
    var html = "<table><tr><th>Category</th><th>Value</th></tr>";
    for (const x in data) {
        var category = x;
        var value = data[x];
        html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
    }
    html += "</table>";
    return html;

}



function getUser() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
          //  $("#ajaxContent").html("Successful Login");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("User not exists or incorrect password");
        }
    };
    var data = $('#loginForm').serialize();
    xhr.open('GET', 'users/details?'+data);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send();
}


function initDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Initialization");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', 'initDB');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}

function insertDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Insertion");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', 'insertRecords');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}


function deleteDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Deletion");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', 'dropdb');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}

//voithitikes sinartiseis gia user/form ean iparxei duplicate kai prospathisei o xristis 
//na kanei register
function canSubmitUserForm() {
    const errorIds = ["USERusernameError", "USERtelephoneError", "USERemailError"];
    for (const id of errorIds) {
        const el = document.getElementById(id);
        if (el && el.innerHTML.trim() !== "") {
            return false; 
        }
    }
    return true; 
}

function canSubmitBandForm() {
    const errorIds = ["BANDusernameError", "BANDtelephoneError", "BANDemailError"];
    for (const id of errorIds) {
        const el = document.getElementById(id);
        if (el && el.innerHTML.trim() !== "") {
            return false;
        }
    }
    return true;
}

//function to register user
function RegisterPost(form){
    let myForm;
    if(form === "user"){
       myForm = document.getElementById("user-form");
       if(!canSubmitUserForm()) {
            return;
        }

    }
    else if(form === "band") {
        myForm = document.getElementById("band-form");
         if(!canSubmitBandForm()) {
            return;
        }
    }
    data = displayFormAsJSON(myForm); //function from assigment2 -> file test.js
   
    //let jsonData = JSON.stringify(data);

    
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            const responseData = JSON.parse(xhr.responseText);
            alert("successful registration");
            location.reload();
            //$('#ajaxContent').html("Successful Registration. Now please log in!<br> Your Data");
            //$('#ajaxContent').append(createTableFromJSON(responseData));
            

        }
        else if(xhr.status !== 200){
            document.getElementById('ajaxContent').innerHTML = 'Request failed. Returned status of' + xhr.status + "<br>";
        }
    };

    xhr.open('POST', '/register');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
}   

function checkDuplicate(type ,username, form){
    //don't run when empty username
    //|| username.trim() === ""
    if(!username ){
        //alert("dupl func");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        //response, no errors
         if (xhr.readyState === 4 && xhr.status === 200){
           
            //console.log("eisai etoimos ");
            document.getElementById(form + type+'Error').innerHTML = " "; //clean error message

        }
        else{
            const responseData = JSON.parse(xhr.responseText);
            document.getElementById(form + type+'Error').innerHTML = responseData.error;

        }
    };

    xhr.open('Get', '/checkDuplicate?type=' + type + '&value=' + username);
    //xhr.set
    xhr.send();
}

function loginPost(){
    //alert("login");
    let form;
    form = document.getElementById("user-login-form");
    let data = displayFormAsJSON(form);
    console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            const responseData = JSON.parse(xhr.responseText);
            alert("successful login");
            //location.reload();
            //user sindethike epitixos
            window.location.href = "Home.html";
            //hide old page
            /*
            document.getElementById("user-form").style.display = "none";
            document.getElementById("band-form").style.display = "none";
            document.getElementById("user-login-form").style.display = "none";
            
            document.getElementById("select_user_or_band").style.display = "none";
            document.getElementById("welcome_msg").style.display = "none";

            //show new page
            document.getElementById("user-profile").style.display = "block";*/

            //$('#ajaxContent').html("Successful Registration. Now please log in!<br> Your Data");
            //$('#ajaxContent').append(createTableFromJSON(responseData));
            

        }
        else if(xhr.status !== 200){
            alert("unsuccessful login");
            document.getElementById('ajaxContent').innerHTML = 'Request failed. Returned status of' + xhr.status + "<br>";
        }
    };



    xhr.open('POST', '/users/details');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);

}

function getUser() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
          //  $("#ajaxContent").html("Successful Login");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("User not exists or incorrect password");
        }
    };
    var data = $('#loginForm').serialize();
    xhr.open('GET', 'users/details?'+data);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send();
}



function logout(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // FRONT END logout
            //localStorage.removeItem("loggedIn");

            // show login page again
            document.getElementById("user-form").style.display = "block";
            document.getElementById("select_user_or_band").style.display = "block";
            document.getElementById("welcome_msg").style.display = "block";

            document.getElementById("user-profile").style.display = "none";
            document.getElementById("band-profile").style.display = "none";
            
        }
    };

    xhr.open("POST", "/logout");
    xhr.send();
}

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
                document.getElementById("user-profile").style.display = "block";
            } else {
                // show login/register forms
                document.getElementById("user-form").style.display = "block";
                document.getElementById("user-login-form").style.display = "none";
                document.getElementById("welcome_msg").style.display = "block";

                document.getElementById("user-profile").style.display = "none";
            }
        }
    };
    xhr.open("GET", "/session");
    xhr.send();
};

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

/*
function populateProfileForm(userData){
    console.log(userData.username);
    const profileSection = document.getElementById("profile-section");
    profileSection.innerHTML = `
    
        <form id="profile-form">
            <div id="firstTria" > 
                <h4>username</h4> <h4>email</h4> <h4>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;password</h4>    
            </div>
            
            <input type="text" id="username" name="username" placeholder="username" value="${userData.username}" readonly>
            <input type="text" id="email" name="email" value="${userData.email}" readonly>
             <input type="text" placeholder="Password" name="password" minlength="8" maxlength="14"
         value="${userData.password}">  <br>





            

            
            <div id="secondTria" > 
                <h4>first name</h4> <h4>last name</h4> <h4>birthdate</h4>
                
                
            </div>
           <input type="text" placeholder="Όνομα" name="firstname" minlength="3" maxlength="30" pattern="(^[^0-9]+$)" value="${escapeHtml(userData.firstname)}">
            <input type="text" placeholder="Επώνυμο" name="lastname" minlength="3" maxlength="30" pattern="(^[^0-9]+$)" value="${userData.lastname}" >
            <input type="date" name="birthdate" min="1920-01-01" max="2011-12-31"  value="${userData.birthdate}" > 

            
             <div id="thirdTria" > 
                <h4>city</h4> <h4>&nbsp;&nbsp;&nbsp;address</h4> <h4>τηλέφωνο</h4>
                
                
            </div>

            <input type="text" placeholder="Πόλη διαμονής" minlength="3" maxlength="30" name="city" value="${userData.city}" >
            <input type="text" placeholder="Διεύθυνση" minlength="10" maxlength="150" name="address" value="${userData.address}" >
            <input type="text" placeholder="Τηλέφωνο"   name="telephone" inputmode="numeric" value="${userData.telephone}" > <br>

           


          
            
            
            
            <button type="button" class="register"  onclick="saveProfile()">Save</button>
        </form>`
        ;
}*/

function populateProfileForm(userData) {
    console.log(userData.username);

    const profileSection = document.getElementById("profile-section");
    profileSection.innerHTML = ""; 

    const form = document.createElement("form");
    form.id = "profile-form";

  
    //const firstRow = document.createElement("div");
    //firstRow.id = "firstTria";

   

    //form.appendChild(firstRow);
    form.appendChild(createTitle("username"));
    form.appendChild(createInput("username", userData.username, true));
    form.appendChild(createTitle("email"));

    form.appendChild(createInput("email", userData.email, true));
    form.appendChild(createTitle("password"));

    form.appendChild(createInput("password", userData.password, false, {
        type: "text",
        minlength: 8,
        maxlength: 14,
        placeholder: "Password"
    }));

    
        form.appendChild(createTitle("firstname"));

    form.appendChild(createInput("firstname", escapeHtml(userData.firstname), false, {
        minlength: 3,
        maxlength: 30,
        pattern: "(^[^0-9]+$)",
        placeholder: "Όνομα"
    }));
    form.appendChild(createTitle("lastname"));

    form.appendChild(createInput("lastname", escapeHtml(userData.lastname), false, {
        minlength: 3,
        maxlength: 30,
        pattern: "(^[^0-9]+$)",
        placeholder: "Επώνυμο"
    }));
    form.appendChild(createTitle("birthdate"));
    let birthdateValue = userData.birthdate.substring(0, 10);
    form.appendChild(createInput("birthdate", escapeHtml(birthdateValue), false, {
        type: "date",
        min: "1920-01-01",
        max: "2011-12-31"
    }));
  
    form.appendChild(createTitle("gender"));


    const maleLabel = document.createElement("label");
    const maleRadio = document.createElement("input");
    maleRadio.type = "radio";
    maleRadio.name = "gender";
    maleRadio.value = "Άντρας";
    if(userData.gender === "Άντρας") maleRadio.checked = true;
    maleLabel.appendChild(maleRadio);
    maleLabel.appendChild(document.createTextNode(" Άντρας"));
    form.appendChild(maleLabel);

    const femaleLabel = document.createElement("label");
    const femaleRadio = document.createElement("input");
    femaleRadio.type = "radio";
    femaleRadio.name = "gender";
    femaleRadio.value = "Γυναίκα";
    if(userData.gender === "Γυναίκα") femaleRadio.checked = true;
    femaleLabel.appendChild(femaleRadio);
    femaleLabel.appendChild(document.createTextNode(" Γυναίκα"));
    form.appendChild(femaleLabel);

    const otherLabel = document.createElement("label");
    const otherRadio = document.createElement("input");
    otherRadio.type = "radio";
    otherRadio.name = "gender";
    otherRadio.value = "Άλλο";
    if(userData.gender === "Άλλο") otherRadio.checked = true;
    otherLabel.appendChild(otherRadio);
    otherLabel.appendChild(document.createTextNode(" Άλλο"));
    form.appendChild(otherLabel);
    form.appendChild(document.createElement("br"));
        



    // Country (select)
    form.appendChild(createTitle("country"));
    const countrySelect = document.createElement("select");
    countrySelect.name = "country";
    countrySelect.id = "country";
    

    const countries = ["Greece","Germany","France","USA"]; 
countries.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.innerText = c;
    if(userData.country === c) option.selected = true;
    countrySelect.appendChild(option);
});


    form.appendChild(countrySelect);

   
    /*const thirdRow = document.createElement("div");
    thirdRow.id = "thirdTria";

    thirdRow.appendChild(createTitle("city"));
    thirdRow.appendChild(createTitle("address"));
    thirdRow.appendChild(createTitle("τηλέφωνο"));

    form.appendChild(thirdRow);*/
    form.appendChild(createTitle("city"));

    form.appendChild(createInput("city", escapeHtml(userData.city), false, {
        minlength: 3,
        maxlength: 30,
        placeholder: "Πόλη διαμονής"
    }));
    form.appendChild(createTitle("address"));

    form.appendChild(createInput("address", escapeHtml(userData.address), false, {
        minlength: 10,
        maxlength: 150,
        placeholder: "Διεύθυνση"
    }));
    form.appendChild(createTitle("telephone"));

    
    const telInput = createInput("telephone", escapeHtml(userData.telephone), false, {
    inputmode: "numeric",
    placeholder: "Τηλέφωνο"
});

telInput.addEventListener('blur', function() {
    checkDuplicate('telephone', this.value, 'PROFUSER');
});

    form.appendChild(telInput);
    const telErrorDiv = document.createElement("div");
    telErrorDiv.id = "PROFUSERtelephoneError";  
    form.appendChild(telErrorDiv);

    form.appendChild(document.createElement("br"));

   
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "register";
    btn.innerText = "Save";
    btn.onclick = saveProfile;

    form.appendChild(btn);

    profileSection.appendChild(form);
}




function createTitle(text) {
    const h4 = document.createElement("h4");
    h4.innerText = text;
    return h4;
}

function createInput(id, value, readonly = false, options = {}) {
    const input = document.createElement("input");

    input.id = id;
    input.name = id;
    input.value = value || "";

    if (readonly) input.readOnly = true;

    // default type
    input.type = options.type || "text";

    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.minlength) input.minLength = options.minlength;
    if (options.maxlength) input.maxLength = options.maxlength;
    if (options.pattern) input.pattern = options.pattern;
    if (options.min) input.min = options.min;
    if (options.max) input.max = options.max;
    if (options.inputmode) input.setAttribute("inputmode", options.inputmode);

    return input;
}


function validateProfilePassword(form) {
    const pass = form.querySelector('[name="password"]');

    let error_msg = form.querySelector(".password-error");

    if (!error_msg) {
        error_msg = document.createElement("span");
        error_msg.classList.add("password-error");
        error_msg.style.color = "red";
        error_msg.style.marginLeft = "20px";
        error_msg.style.display = "block";
        pass.insertAdjacentElement("afterend", error_msg);
    }

    let isWeak = true;

    if (isPasswordSafe(pass.value)) {
        error_msg.style.color = "red";
        error_msg.textContent = "weak password";
    }
    else if (contain_40_nums(pass.value)) {
        error_msg.style.color = "red";
        error_msg.textContent = "password contains too much numbers";
    }
    else if (contain_50_char(pass.value)) {
        error_msg.style.color = "red";
        error_msg.textContent = "50% same char";
    }
    else if (check_if_strong(pass.value)) {
        error_msg.style.color = "green";
        error_msg.textContent = "Strong Password";
        isWeak = false;
    }
    else if (pass.value.length >= 8) {
        error_msg.style.color = "orange";
        error_msg.textContent = "Medium Password";
        isWeak = false;
    }
    else if (pass.value.length === 0) {
        error_msg.remove();
        return true; 
    }
    else {
        error_msg.remove();
    }

    return !isWeak;
}

function saveProfile(){
   

    //2 checks password and telephone
    const form = document.getElementById("profile-form");
    if (!validateProfilePassword(form)) {
        return;
    }
      const telError = document.getElementById("PROFUSERtelephoneError")

           if (telError.innerHTML.trim() !== "") {
            console.log("prepei na min kanei save");
            return; 
        }

    
    const data = displayFormAsJSON(form);

   

    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
    };
    xhr.open("PUT", "/user/profile");
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.send(data);


}

