const userForm = document.getElementById("user-form");
const bandForm = document.getElementById("band-form");





function validatepass(form){
    const pass = form.querySelector('[name="password"]');
    const confirm_pass = form.querySelector('[name="confirm_password"]');

    let error_msg = form.querySelector(".password-error") ;

        if(!error_msg){
        error_msg = document.createElement("span");
        error_msg.classList.add("password-error");
        error_msg.style.color = "red";
       error_msg.style.marginLeft = "20px";
       error_msg.style.marginTop = "20px"; // no effect, change 
        confirm_pass.insertAdjacentElement("afterend", error_msg);
        }



    let isWeak = true;

    //password contains forbidden word
    if (isPasswordSafe(pass.value)){
        console.log("forbidden words test passed");
        error_msg.style.color = "red";
        error_msg.textContent = "weak password";
        
    }
    //40% of pass contains numbers
    else if (contain_40_nums(pass.value) ){
        error_msg.style.color = "red";
        error_msg.textContent = "password contains too much numbers";
    }
    //50% same character
    else if(contain_50_char(pass.value)){
        error_msg.style.color = "red";
        error_msg.textContent = "50% same char";
    }
    //2 password are not the same
    else if(confirm_pass.value !== "" && pass.value !== confirm_pass.value){
        error_msg.style.color = "red";
        error_msg.textContent = " ⚠️ passwords should match";
        
    }
    else if(check_if_strong(pass.value)){
        error_msg.style.color = "green";
        error_msg.textContent = "Strong Password";
        isWeak = false;
    }
    else if(pass.value.length>=8){
        error_msg.style.color = "orange";
        error_msg.textContent = "Medium Password";
        isWeak = false;
    }
    else{
        error_msg.remove(); //password test passes.
       
    }

    if(confirm_pass.value !== "" && !isWeak){
        isWeak = false;
    }
    else{
        isWeak = true;
    }
    
    
    return !isWeak;
}



function show_pass(type){
    let form;
    if(type === 'user'){
        form = document.getElementById("user-form");
   }
   else{
    form = document.getElementById("band-form");
   }
    const pass = form.querySelector('[name="password"]');
    const confirm_pass = form.querySelector('[name="confirm_password"]');
    const btn = form.querySelector(".show-passwd");
    const icon = btn.querySelector("img");

    if(pass.type === "password"){
        pass.type = "text";
        confirm_pass.type = "text";
        icon.src = "eye_open.svg";
    }
    else{
        pass.type = "password";
        confirm_pass.type = "password"
        icon.src = "eye_closed.svg";
    }

   

}

function isPasswordSafe(password){
    const forbidden = ["band", "music", "mpanta", "mousiki"];
    const ifContainsForbidden = forbidden.some(word => 
    password.toLowerCase().includes(word)
    );

    return ifContainsForbidden;
}

function contain_40_nums(password){
    let sum=0;
    for (let i=0; i<password.length; i++){
        if(!isNaN(password[i]) && password[i]!== ' '){
            sum++
            
        }
    }

    let percentage = (sum / password.length) * 100;
    if(percentage >= 40){
        return true;
    }
    else{
        return false;
    }
}


function contain_50_char(password){
    let freq= {};

    for (let char of password) {
        if (freq[char] === undefined) {
            freq[char] = 1;
        } else {
            freq[char] = freq[char] + 1;
        }
    }

    let max = Math.max(...Object.values(freq));

    
    let percentage = (max / password.length) * 100;
    if(percentage >= 50){
        return true;
    }
    else{
        return false;
    }

}

function check_if_strong(password){
    //.test() returns true/false
    const upperCase = /[A-Z]/.test(password); 
    const lowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    return upperCase && lowerCase && hasNumber && hasSymbol && password.length >=8;
}

[userForm, bandForm].forEach(form => {
    const passInput = form.querySelector('[name="password"]');
    const confirmInput = form.querySelector('[name="confirm_password"]');


    confirmInput.addEventListener('input', () => validatepass(form));
    passInput.addEventListener('input', () => validatepass(form));
});


let mapVisible = false;
let map; 
const toggleMapBtn = document.getElementById("toggle-map-btn");
const mapContainer = document.getElementById("map-container");

function addMarker(mapInstance, lat, lon) {
    // projections
    const fromProj = new OpenLayers.Projection("EPSG:4326");
    const toProj = new OpenLayers.Projection("EPSG:900913");
    const position = new OpenLayers.LonLat(lon, lat).transform(fromProj, toProj);

    // check for already layers
    let markersLayer = mapInstance.getLayersByName("Markers")[0];
    if (!markersLayer) {
        markersLayer = new OpenLayers.Layer.Markers("Markers");
        mapInstance.addLayer(markersLayer);
    }

    const marker = new OpenLayers.Marker(position);
    markersLayer.addMarker(marker);

    mapInstance.setCenter(position, 15);
}

function toggleMap(lat, lon) {
    if (!mapVisible) {
        mapContainer.style.display = "block";

        map = new OpenLayers.Map("map-container");
        const mapnik = new OpenLayers.Layer.OSM();
        map.addLayer(mapnik);

      
        addMarker(map, lat, lon);

        mapVisible = true;
    } else {
        mapContainer.style.display = "none";
        mapContainer.innerHTML = "";
        mapVisible = false;
    }
}

let lat;
let lon;

function geoLoc(){
     //feedbackDiv.style.color = "red"
    const country = document.getElementById("country").value;
    const city = userForm.querySelector('[name="city"]').value;
    const address = userForm.querySelector('[name="address"]').value;

    const fullAddress = address + " " + city + " " + country;
    
    const feedbackDiv = document.getElementById("address-feedback");


     const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
       
        if (this.readyState === this.DONE) {
            try {
                const response = JSON.parse(xhr.responseText);

                if (!response || response.length === 0) {
                    feedbackDiv.textContent = "Η τοποθεσία δεν βρέθηκε. Παρακαλώ ελέγξτε τα στοιχεία σας.";
                    return;
                }

                else{
                    const firstResult = response[0];
                    //const country = firstResult.address.city; 
                    //alert(JSON.stringify(firstResult, null, 2));

                    const countrySelect = document.getElementById("country");

                    const selectedCountryValue = countrySelect.value;

                    const selectedCountryText = countrySelect.options[countrySelect.selectedIndex].text;

                        if (selectedCountryText !== "Greece") {
                            const feedbackDiv = document.getElementById("address-feedback");
                            feedbackDiv.style.color = "red";
                            feedbackDiv.textContent = "Η υπηρεσία είναι διαθέσιμη μόνο για περιοχές στην Ελλάδα.";
                            return;
                        }
                        else{
                            feedbackDiv.textContent = "";
                             lat = firstResult.lat;
                             lon = firstResult.lon;

                            /*feedbackDiv.style.color = "green";
                            feedbackDiv.textContent = `Lat: ${lat}, Lon: ${lon}`;*/
                            const toggleMapBtn = document.getElementById("toggle-map-btn");
                            toggleMapBtn.style.display = "inline-block";
                            toggleMapBtn.onclick = function(){
                                toggleMap(lat, lon);
                            }
                        }

                    }
            } catch (err) {
                feedbackDiv.textContent = "Σφάλμα κατά την επεξεργασία της απάντησης από το API.";
            }
        }
    });

    const key = "6ae44b8f35msh653c703d82ccc90p1ae04ajsnf99142cffd8e";//mykEY
    xhr.open("GET", "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" + encodeURIComponent(fullAddress) + "&accept-language=en&polygon_threshold=0.0");
    xhr.setRequestHeader("x-rapidapi-host", "forward-reverse-geocoding.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", key);

    xhr.send();

 
}

const addressInput = userForm.querySelector('[name="address"]');
const city = userForm.querySelector('[name="city"]');
const country = document.getElementById("country");



addressInput.addEventListener("focus", () => {
    toggleMapBtn.style.display = "none";
    mapContainer.style.display = "none";
    
});

city.addEventListener("focus", () => {
    toggleMapBtn.style.display = "none";
    mapContainer.style.display = "none";
});
country.addEventListener("focus", () => {
    toggleMapBtn.style.display = "none";
    mapContainer.style.display = "none";
});

country.addEventListener("focusout", () => {
    if(city.value !== "" && addressInput.value !== ""){
        geoLoc();
    }
    
});
addressInput.addEventListener("focusout", () => {
    if(city.value !== "" && addressInput.value !== ""){
        geoLoc();
        //alert("telos");
        //RegisterPost("user");
        
        
    }
    
});
//function to convert and display Json 
function displayFormAsJSON(form) {
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
     if(lat !== null && lon !== null){
        formObject.lat = lat;
        formObject.lon = lon;
    }
    //formObject.formType = form.id === "user-form" ? "user" : "band"; //user|| band
    if (form.id === "user-form") {
        formObject.formType = "user";
    } else if (form.id === "band-form") {
        formObject.formType = "band";
    } else if (form.id === "user-login-form") {
        formObject.formType = "login";
    }
    else if (form.id === "review-post-form"){
        formObject.formType = "review";
    }
    else if (form.id === "AdminLoginForm"){
        formObject.formType = "admin";
    }
    
    const jsonString = JSON.stringify(formObject, null, 2); 
    return jsonString
}

userForm.addEventListener("submit", function(event){
    //event.preventDefault(); 
    if(!userForm.checkValidity()){
        userForm.reportValidity(); //messages for user 
        event.preventDefault(); 
        return;
    }
    if(!validatepass(userForm)){
        return; 
    }
    else{
        jsn = displayFormAsJSON(userForm);

        localStorage.setItem("userFormJSON", jsn);

        //RegisterPost("user");

    }

    
});


bandForm.addEventListener("submit", function(event){
     if(!bandForm.checkValidity()){
        bandForm.reportValidity();
        event.preventDefault();
        return;
    }
    //jsn = displayFormAsJSON(bandForm);

    //localStorage.setItem("bandFormJSON", jsn);

});

localStorage.clear();
/*
window.addEventListener("load", () => {
    const userJSON = localStorage.getItem("userFormJSON");
    if(userJSON){
        setTimeout(() => {
            document.getElementById("json-output-user").innerText = '';
        }, 500);
    }

    const bandJSON = localStorage.getItem("bandFormJSON");
    if(bandJSON){
        setTimeout(() => {
            document.getElementById("json-output-band").innerText = '';
        }, 500);
    }
});

*/

function show_login_form(){
    const userForm = document.getElementById("user-form");
    const userLoginForm = document.getElementById("user-login-form");

    userForm.style.display = "none";
    userLoginForm.style.display = "block";

}

function show_register_form(){
    const userForm = document.getElementById("user-form");
    const userLoginForm = document.getElementById("user-login-form");
    userForm.style.display = "block";
    userLoginForm.style.display = "none";
}

function showSection(sectionId) {
  const sections = ['home-section', 'profile-section', 'booking-section'];
  sections.forEach(id => {
    document.getElementById(id).style.display = 
      id === sectionId ? 'block' : 'none';
  });
  if(sectionId === "profile-section"){
        showInfo();
    }
}



/*
function logout(){
            document.getElementById("user-form").style.display = "block";
            
            document.getElementById("select_user_or_band").style.display = "block";
            document.getElementById("welcome_msg").style.display = "block";

            //show new page
            document.getElementById("user-profile").style.display = "none";

}*/