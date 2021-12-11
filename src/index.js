const pups = [];
let goodAttitudeFlag = false;

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/pups")
    .then(resp => resp.json())
    .then(result => renderPupsOnBar(result))

  document.querySelector("#good-dog-filter").addEventListener("click", handleDogFilter);

});

function renderPupsOnBar(fetchedPups) {
  const div = document.querySelector("#dog-bar");
  fetchedPups.forEach((pup) => {
    // save the pup to global pups array so we can avoid GET fetching again
    pups.push(pup);
    div.append(renderPupSpan(pup));
  });

}

function renderPupSpan(pup) {
// render a sinle pup for the pup bar
  const span = document.createElement("span");
  span.textContent = pup.name;
  span.id = pup.id;
  span.addEventListener("click", renderPup);
  return(span)

}

function renderPup(event) {
// fires when a pup is clicked in the pup bar
//  to display detals for that pup
  pupId.set(pups[parseInt(event.target.id)-1].id);
  const pup = pups[pupId.get()-1];
  const div = document.querySelector("#dog-info");
  const h2 = document.createElement("h2");
  const img = document.createElement("img");
  const btn = document.createElement("button");

  h2.textContent = pup.name;
  img.src = pup.image;
  btn.textContent = getAttitude(pup.isGoodDog);
  btn.addEventListener("click", handleAttitude);
  div.innerHTML = "";
  div.append(h2);
  div.append(img);
  div.append(btn);

}

const getAttitude = (flag) => flag ? "Good Dog!" : "Bad Dog!";

const pupId = function () {
// pupId() sets and gets id of the currently display pup details
// could also do this with a global variable
  let currId = null;
  return {
    set: (id) => {
      currId = id;
      return currId;
    },
    get: (id) => currId
  }
}();

function handleAttitude(event) {
// flip the dog's attitude from good to bad or vice-verse
  const id = pupId.get();
  const newAttitude = !pups[id - 1].isGoodDog;

  const dataObj = {
    id: id,
    isGoodDog: newAttitude
  }
  fetch(`http://localhost:3000/pups/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataObj)
  })
  .then(res => res.json())
  .then(pup => {
    // update the button text
    event.target.textContent = getAttitude(newAttitude);
    // update our global pups array
    pups[id - 1].isGoodDog = newAttitude;
  })
  .catch(err => {
    alert(`pup update failed! error: ${err.message}`);
  });

}

function handleDogFilter(event) {
// fires when "Filter good dogs" is clicked 
  goodAttitudeFlag = !goodAttitudeFlag;
  event.target.textContent = `Filter good dogs: ${goodAttitudeFlag ? "ON" : "OFF"}`;
  filterPups();

}

function filterPups() {
// re-render the dog bar to flip between only "good" or all pups
  const div = document.querySelector("#dog-bar");
  div.innerHTML = "";

  pups.forEach((pup) => {
    if (goodAttitudeFlag) {
      // filter is ON to show only "good" dogs
      if (pup.isGoodDog) {
        // good dog, show it
        div.append(renderPupSpan(pup));
      } else {
        // bad dog, if details showing, remove
        if (pupId.get() === pup.id) {
          document.querySelector("#dog-info").innerHTML = "";
        }
      }
    }
    else {
      // filter is off, show all dogs
      div.append(renderPupSpan(pup));
    }
  });

}
