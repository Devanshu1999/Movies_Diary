let addProfileButton = document.querySelector('#profileForm');

//ADD PROFILE
addProfileButton.addEventListener('submit', async (e) => {
    e.preventDefault();
    let profileName = document.querySelector('#profileName');
    const response = await fetch('/welcome', {
        method: "POST",
        body: JSON.stringify({
            profile: profileName.value
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    });
    if(response.status === 204){
        if(document.getElementById('profile-error')){
            document.getElementById('profile-error').remove();
        }
        addProfileButton.insertAdjacentHTML('beforeend', `<span id="profile-error" style="transition: opacity 1s; color: red;">Profile already exists</span>`);
        userExistsError();
        return;
    }

    const profile = profileName.value.trim();
    const profileId = profile.replace(' ', '-');

    const profileList = document.getElementById('list-tab');
    
    profileList.insertAdjacentHTML("beforeend", `<button class="list-group-item list-group-item-action" value="${profile}" data-bs-toggle="list"
    onclick=showList(this.value) role="tab">${profile}</button>`);
    addProfileButton.reset();
});

//SHOW PROFILE
showList = async (profileName) => {
    const profileId = profileName.replace(' ', '-');

    const profileData = document.getElementById('nav-tabContent');
    profileData.innerHTML = `<div class="tab-pane fade show active" id="${profileId}-data" value="${profileName}" role="tabpanel">
    <button value = "${profileName}" onclick=deleteProfile(this.value) class="btn btn-danger" style="float: right;">Delete Profile</button>
    <div style="margin: auto; width: 50%;">    
        <form id="movieForm" method="POST" autocomplete="off">
            <label for="movieName" style="font-size: 20px">Add Movie in \'${profileName}\': </label>
            <input type="text" id="movieName" name="q" onKeyUp="suggestMovies(this.value)" placeholder="Search movies..." required />
            <div class = "row" id="results" style= "z-index: 10;
            position: absolute;"></div>
        </form>
    </div>
    </div>
    <br>
    <div id="cards" value="${profileName}" class="row row-cols-1 row-cols-md-4 g-8" style= "z-index: 1;"></div>`;

    location.href = "#" + profileId + "-data";
    
    const response = await fetch('/getData', {
        method: 'POST',
        body: JSON.stringify({
            profile: profileName
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })

    const movieIDs = await response.json();
    const cards = document.getElementById("cards");

    let resp, movieData;
    for(let i = 0; i<movieIDs.length; i++) {
        resp = await fetch('/getMovie/' + movieIDs[i]);
        movieData = await resp.json();
        if(movieData.error){
            console.log(data.error);
            return;
        }
    
        cards.insertAdjacentHTML('beforeend', `<div class="col" id=${movieData.id}><div class="card h-100" style="width: 18rem;">
        <img src="https://image.tmdb.org/t/p/w185${movieData.poster}" class="card-img-top" width= "154" height= "231" alt="NoImage" onerror="this.src='imgs/NoImage.jpg';">
        <div class="card-body">
          <h5 class="card-title">${movieData.title}</h5>
          <p class="card-text" style="font-style: italic;">Release date - ${movieData.release_date} <br> Runtime - ${movieData.runtime} min <br> Rating - ${movieData.rating} ★</p>
          <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#overview-${movieData.id}">Overview</button>
          <button class="btn btn-danger" onclick="deleteMovie(${movieData.id},'${profileName}')">Remove</button>
        </div>
      </div></div>
      <div class="modal fade" id="overview-${movieData.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">${movieData.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${movieData.overview}
                </div>
            </div>
        </div>
    </div>`);
    }
}

//GET MOVIE SEARCH RESULTS
let timer = 0;
suggestMovies = (movieName) => {
    if(timer){
        clearTimeout(timer);
    }
    
    timer = setTimeout(async () => {
        const results = document.getElementById('results');

        if(movieName.trim() === ''){
            results.innerHTML = '';
            return;
        }

        const response = await fetch('/suggestMovies/' + movieName);
        const data = await response.json();
        
        if(data.length){
            let list = '';
            for(var i = 0; i<data.length; i++){
                list += `<li><img class="resultImgs" src='https://image.tmdb.org/t/p/w92${data[i].poster}' vertical-align=middle
                width= "60" height= "60" alt="NoImage" onerror="this.src='imgs/NoImage.jpg';"><p>${data[i].title}<br>${data[i].release_date}</p>&ensp;
                <button type="button" class="btn btn-primary" style="float: right; vertical-align=middle" onclick=addMovie(${data[i].id})>Add</button></li>`;
            }
            results.innerHTML = '<div class="col-md-12" id="results-table"><ul>' + list + '</ul></div>';
        }
        else{
            results.innerHTML = '<ul><li>Not found!</li></ul>';
            console.log("Not found");
        }
    }, 400);
};

//ADD MOVIE TO THE SELECTED PROFILE
addMovie = async (id) => {
    const cards = document.getElementById('cards');
    const profileName = cards.getAttribute('value');
    const response = await fetch('/saveMovie', {
        method: 'POST',
        body: JSON.stringify({
            profile: profileName,
            movieId: id
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    });

    const data = await response.json();
    
    if(data.error){
        if(document.getElementById('movie-error')){
            document.getElementById('movie-error').remove();
        }
        document.getElementById('movieForm').insertAdjacentHTML('beforeend', `<span id="movie-error" style="transition: opacity 1s; color: red;">Movie already exists</span>`);
        movieExistsError();
        return;
    }
    
    cards.insertAdjacentHTML('beforeend', `<div class="col" id=${data.id}><div class="card h-100" style="width: 18rem;">
    <img src="https://image.tmdb.org/t/p/w185${data.poster}" class="card-img-top" width= "154" height= "231" alt="NoImage" onerror="this.src='imgs/NoImage.jpg';">
    <div class="card-body">
      <h5 class="card-title">${data.title}</h5>
      <p class="card-text" style="font-style: italic;">Release date - ${data.release_date} <br> Runtime - ${data.runtime} min <br> Rating - ${data.rating} ★</p>
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#overview-${data.id}">Overview</button>
      <button class="btn btn-danger" onclick="deleteMovie(${data.id},'${profileName}')">Remove</button>
    </div>
  </div></div>
    <div class="modal fade" id="overview-${data.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">${data.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${data.overview}
                </div>
            </div>
        </div>
    </div>`);
}

deleteMovie = async (id, profileName) => {
    const response = await fetch('/deleteMovie', {
        method: 'POST',
        body: JSON.stringify({
            profile: profileName,
            movieId: id
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    });

    if(response.status === 404){
        console.log("Error deleting the movie");
    }

    const card = document.getElementById(id);
    card.remove();
}

//DELETE PROFILE
deleteProfile = async (profileName) => {
    response = await fetch('/deleteProfile', {
            method: 'POST',
            body: JSON.stringify({
                profile: profileName
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        });

        if(response.status === 204){
            // POPULATE THE ERROR +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            console.log("Error deleteing profile");
            return;
        }
        document.querySelectorAll(`button[value='${profileName}']`).item(0).remove();
        document.querySelectorAll(`div[value='${profileName}']`).item(0).remove();
        document.getElementById('cards').remove();
}

//HIDE SEARCH RESULTS WHEN CLICKED OUTSIDE
window.addEventListener("click", function(e) {
    const results = document.getElementById('results');
    if(results && !results.contains(e.target)){
        results.innerHTML = '';
    }
});

userExistsError = () => {
    const error = document.getElementById('profile-error');
    setTimeout(() => {
        error.style.opacity = 0;
    }, 1000);
};

movieExistsError = () => {
    const error = document.getElementById('movie-error');
    setTimeout(() => {
        error.style.opacity = 0;
    }, 1000);
};