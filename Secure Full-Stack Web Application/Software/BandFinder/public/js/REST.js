function createTableFromJSON(data,i) {
	var html = "<h4>Laptop "+i+"</h4><table><tr><th>Category</th><th>Value</th></tr>";
    for (const x in data) {
        var category=x;
        var value=data[x];
        html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
    }
    html += "</table><br>";
    return html;

}



//REST 
function postReview(){
    console.log("ajax.js review doylevei");
    const form = document.getElementById("review-post-form");
    //const data = displayFormAsJSON(form);
     const data = {
        band_name: form.band_name.value,
        sender: form.sender.value,
        review: form.review.value,
        rating: parseInt(form.rating.value)
    };
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.readyState === 4) {
            document.getElementById("rest-api-output").innerText = xhr.responseText;
        }
    };
    
    xhr.open("POST", "/ubAPI/review");
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log(JSON.stringify(data));
    xhr.send(JSON.stringify(data));
}

function getReviews() {
    const bandName = document.getElementById("band_name_get").value;
    const ratingFrom = document.getElementById("ratingFrom").value;
    const ratingTo = document.getElementById("ratingTo").value;

    let url = `/ubAPI/reviews/${bandName}`;

    const params = [];

    if (ratingFrom !== "") params.push(`ratingFrom=${ratingFrom}`);
    if (ratingTo !== "") params.push(`ratingTo=${ratingTo}`);

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    const xhr = new XMLHttpRequest();

  xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const obj = JSON.parse(xhr.responseText);

            let output = "<h3>" + obj.length + " Reviews</h3>";
            let i = 1;

            for (let id in obj) {
                output += createTableFromJSON(obj[id], i);
                i++;
            }

            document.getElementById("rest-api-output").innerHTML = output;

        } else if (xhr.readyState === 4) {
            document.getElementById("rest-api-output").innerText = xhr.responseText;
        }
    };


    xhr.open("GET", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}

function updateReviewStatus() {
    const reviewId = document.getElementById("review_id_put").value;
    const status = document.getElementById("status_put").value;

    if (!reviewId || !status) {
        document.getElementById("rest-api-output").innerText = "Missing review_id or status";
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            document.getElementById("rest-api-output").innerText = xhr.responseText;
        }
    };

    xhr.open("PUT", `/ubAPI/reviewStatus/${reviewId}/${status}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}


function deleteReview(){
    const reviewId = document.getElementById("review_id_del").value;

    if (!reviewId ) {
        document.getElementById("rest-api-output").innerText = "Missing review_id";
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onload = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            document.getElementById("rest-api-output").innerText = xhr.responseText;

        }
        else if (xhr.readyState === 4) {
            document.getElementById("rest-api-output").innerText =
                "Error: " + xhr.status + " - " + xhr.responseText;
        }
    };

    xhr.open("DELETE", `/ubAPI/reviewDeletion/${reviewId}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();



 
}