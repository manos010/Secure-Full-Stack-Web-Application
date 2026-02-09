window.onload = function() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.readyState === 4 && xhr.status === 200){
            const data = JSON.parse(xhr.responseText);
            
            if(data.loggedIn && data.admin){
                // Hide login form
                document.getElementById("AdminLoginPage").style.display = "none";
                

                // Show admin panel
                document.getElementById("adminContainer").style.display = "flex";

               
                
            } else {
                // Show login form
                document.getElementById("AdminLoginForm").style.display = "flex";
                document.getElementById("LoginMsg").style.display = "block";

                // Hide admin panel
                document.getElementById("adminContainer").style.display = "none";
            }
        }
    };
    xhr.open("GET", "/session");
    xhr.send();
};

// Logout function
function adminLogout() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.readyState === 4 && xhr.status === 200){
            // Show login form again
           /* document.getElementById("AdminLoginForm").style.display = "flex";
            document.getElementById("LoginMsg").style.display = "block";            
            document.getElementById("adminContainer").style.display = "none";*/
            window.location.reload();
        } else {
            alert("Logout failed");
        }
    };
    xhr.open("POST", "/logout");
    xhr.send();
}


document.addEventListener('DOMContentLoaded', () => {
    loadAdminStats();
    loadUsers();
});

function adminLogin(){
    console.log("enadiotest")
    const form = document.getElementById("AdminLoginForm");
    const data = {
        username: form.username.value,
        password: form.password.value
    };
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Admin login successful!");
            document.getElementById("AdminLoginPage").style.display = "none";
            document.getElementById("adminContainer").style.display = "block";
            /*window.location.href = "/adminPanel.html"; */ 
        } /*else {
            alert("Wrong admin credentials");
        }*/
    };

    xhr.open("POST", "/admin/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

//users for admin
function loadUsers() {
    const usersPage = document.getElementById("usersPage");
    usersPage.innerHTML = "<h2>Users Page</h2>";

    const usersList = document.createElement("div");
    usersList.id = "usersList";
    usersList.style.display = "flex";
    usersList.style.flexDirection = "column";
    usersList.style.gap = "10px";
    usersPage.appendChild(usersList);

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const users = JSON.parse(xhr.responseText);

            users
            .filter(user => user.username !== "admin")
            .forEach(user => {
                const div = document.createElement("div");
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.padding = "5px 10px";
                div.style.backgroundColor = "#f0f0f0";
                div.style.borderRadius = "5px";

                const usernameSpan = document.createElement("span");
                usernameSpan.textContent = user.username;

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.style.background = "#e74c3c";
                deleteBtn.style.color = "white";
                deleteBtn.style.border = "none";
                deleteBtn.style.borderRadius = "4px";
                deleteBtn.style.cursor = "pointer";

                deleteBtn.onclick = function() {
                    if (confirm(`Delete user ${user.username}?`)) {
                        const delXhr = new XMLHttpRequest();
                        delXhr.onload = function() {
                            if (delXhr.readyState === 4 && delXhr.status === 200) {
                                div.remove();
                            } else {
                                alert("Failed to delete user");
                            }
                        };
                        delXhr.open("DELETE", "/admin/user");
                        delXhr.setRequestHeader("Content-Type", "application/json");
                        delXhr.send(JSON.stringify({ username: user.username }));
                    }
                };

                div.appendChild(usernameSpan);
                div.appendChild(deleteBtn);
                usersList.appendChild(div);
            });

        } else {
            usersList.innerHTML = "Failed to load users";
        }
    };

    xhr.open("GET", "/users");
    xhr.send();
}

//reviews for admin
function loadPendingReviews() {
    const reviewsPage = document.getElementById("reviewsPage");
    reviewsPage.innerHTML = "<h2>Pending Reviews</h2>";

    const reviewsList = document.createElement("div");
    reviewsList.id = "reviewsList";
    reviewsList.style.display = "flex";
    reviewsList.style.flexDirection = "column";
    reviewsList.style.gap = "10px";
    reviewsPage.appendChild(reviewsList);

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const reviews = JSON.parse(xhr.responseText);

            
            reviews
            .filter(review => review.status === "pending")
            .forEach(review => {
                const div = document.createElement("div");
                div.style.display = "flex";
                div.style.flexDirection = "column";
                div.style.padding = "10px";
                div.style.backgroundColor = "#f0f0f0";
                div.style.borderRadius = "5px";

                const bandSpan = document.createElement("span");
                bandSpan.textContent = "Band: " + review.band_name;

                const senderSpan = document.createElement("span");
                senderSpan.textContent = "Sender: " + review.sender;

                const textSpan = document.createElement("span");
                textSpan.textContent = "Review: " + review.review;

                const ratingSpan = document.createElement("span");
                ratingSpan.textContent = "Rating: " + review.rating;

                const approveBtn = document.createElement("button");
                approveBtn.textContent = "Approve";
                approveBtn.style.marginRight = "5px";
                approveBtn.onclick = function() {
                    updateReviewStatus(review.review_id, "published", div);
                };

                const rejectBtn = document.createElement("button");
                rejectBtn.textContent = "Reject";
                rejectBtn.onclick = function() {
                    updateReviewStatus(review.review_id, "rejected", div);
                };

                const btnContainer = document.createElement("div");
                btnContainer.style.marginTop = "5px";
                btnContainer.appendChild(approveBtn);
                btnContainer.appendChild(rejectBtn);

                div.appendChild(bandSpan);
                div.appendChild(senderSpan);
                div.appendChild(textSpan);
                div.appendChild(ratingSpan);
                div.appendChild(btnContainer);

                reviewsList.appendChild(div);
            });
        } else {
            reviewsList.innerHTML = "No pending reviews yet...";
        }
    };

    xhr.open("GET", "/ubAPI/Pendingreviews/all"); 
    xhr.send();
}


function updateReviewStatus(review_id, status, div) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            div.remove(); 
        } else {
            alert("Failed to update review");
        }
    };
    xhr.open("PUT", `/ubAPI/reviewStatus/${review_id}/${status}`);
    xhr.send();
}

//statistics for admin
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values

function drawChart() {
 

   var options = {'title':'My Average Day', 'width':550, 'height':400};
    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart_bands_by_city'));
    chart.draw(data, options);
    var chart1 = new google.visualization.PieChart(document.getElementById('piechart_public_private'));
    chart1.draw(data, options);
     var chart3 = new google.visualization.PieChart(document.getElementById('piechart_users_bands'));
    chart3.draw(data, options);
     var chart4 = new google.visualization.PieChart(document.getElementById('piechart_revenue'));
    chart4.draw(data, options);
}



function loadAdminStats() {
    // 1. Bands per city
    const xhrBands = new XMLHttpRequest();
    xhrBands.onload = function() {
        if (xhrBands.readyState === 4 && xhrBands.status === 200) {
            const bands = JSON.parse(xhrBands.responseText);

            const cityCounts = {};
            bands.forEach(b => {
                cityCounts[b.band_city] = (cityCounts[b.band_city] || 0) + 1;
            });

            const cityData = [['City', 'Bands']];
            for (const city in cityCounts) {
                cityData.push([city, cityCounts[city]]);
            }

            drawPieChart('piechart_bands_by_city', cityData, 'Bands per City');
        }
    };
    xhrBands.open("GET", "/bands/search");
    xhrBands.send();

    
    const xhrEvents = new XMLHttpRequest();
    xhrEvents.onload = function() {
        if (xhrEvents.readyState === 4 && xhrEvents.status === 200) {
            const data = JSON.parse(xhrEvents.responseText);

            const publicCount = data.publicEvents.length;
            const privateCount = data.privateEvents.length;

            const chartData = [
                ['Type', 'Count'],
                ['Public', publicCount],
                ['Private', privateCount]
            ];

            drawPieChart('piechart_public_private', chartData, 'Public / Private Events');
        } else {
            console.error("Failed to load events data:", xhrEvents.status);
        }
    };

    xhrEvents.open("GET", "/admin/events");
    xhrEvents.send();


    const xhrbandUsers = new XMLHttpRequest();
    xhrbandUsers.onload = function() {
        if (xhrbandUsers.readyState === 4 && xhrbandUsers.status === 200) {
            const data = JSON.parse(xhrbandUsers.responseText);

            const usersCount = data.users.length;
            const bandsCount = data.bands.length;

            const chartData1 = [
                ['Type', 'Count'],
                ['users', usersCount - 1 ],
                ['bands', bandsCount]
            ];

            drawPieChart('piechart_users_bands', chartData1, 'Users / Bands');
        } else {
            console.error("Failed to load band/users data:", xhrbandUsers.status);
        }
    };

    xhrbandUsers.open("GET", "/admin/bandUsers");
    xhrbandUsers.send();


    //admin - profit pie chart 
    const xhrPrice = new XMLHttpRequest();
    xhrPrice.onload = function () {
        if (xhrPrice.readyState === 4 && xhrPrice.status === 200) {
            const data = JSON.parse(xhrPrice.responseText);

            const totalRevenue = Number(data.total);
            const siteProfit = totalRevenue * 0.15;

            const chartData = [
                ['Type', 'Amount (€)'],
                ['Site Profit (15%)', siteProfit],
                ['Bands Revenue (85%)', totalRevenue - siteProfit]
            ];

            drawPieChart(
                'piechart_revenue',
                chartData,
                'Site Revenue from Private Events'
            );
        }
    };

    xhrPrice.open("GET", "/admin/revenue");
    xhrPrice.send();

}


function drawPieChart(containerId, dataArray, title) {
    const data = google.visualization.arrayToDataTable(dataArray);

    const options = {
        title: title,
        width: 550,
        height: 400,
    };

    const chart = new google.visualization.PieChart(document.getElementById(containerId));
    chart.draw(data, options);
}

// ----------------- Load Charts on Page -----------------
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(loadAdminStats);


function showsection(sectionId) {
  const sections = ['usersPage', 'reviewsPage', 'statisticsPage'];
  sections.forEach(id => {
    document.getElementById(id).style.display = 
      id === sectionId ? 'block' : 'none';
  });
    if (sectionId === "usersPage") {
        loadUsers();
    }
    else  if (sectionId === "reviewsPage") {

        loadPendingReviews();
    }

}



