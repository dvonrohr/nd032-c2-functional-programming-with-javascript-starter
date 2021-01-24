let store = {
    chosenRover: 'Curiosity',
    roverImages: [],
    roverInformation: [],
    rovers: ["Curiosity", "Opportunity", "Spirit"],
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
};

const render = async (root, state) => {
    root.innerHTML = App(state);

    document.querySelectorAll("[data-load]").forEach((button) => {
        button.addEventListener("click", (function (event) {
            event.preventDefault();
            const chosenRover = event.target.dataset?.load;
            if (chosenRover) updateStore(state, {chosenRover});
        }));
    });
};

// create content
const App = (state) => {
    let {roverImages, roverInformation, chosenRover} = state;

    return `
        <header></header>
        <main>
            <nav>
              ${Navigation(store.rovers)} 
            </nav>
            <section>
                <div>
                    ${displayRoverInfo(roverImages, roverInformation, chosenRover)}
                </div>
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Navigation = (rovers) => {
    const navigationItems = rovers.map(
        (rover) => `<button data-load="${rover}">${rover}</button>`
    );
    return navigationItems.join('');
};

// Example of a pure function that renders infomation requested from the backend
const displayRoverInfo = (roverImages, roverInformation, chosenRover) => {
    const hasRover = chosenRover !== roverInformation?.name;

    // if state has not current rover informations, fetch them
    if (!roverInformation?.name || chosenRover !== roverInformation?.name) {
        getRoverInformation(store);
    }

    return `
        <h2>${roverInformation.name}</h2>
        <div class="slider">
            <div class="slides">
                ${roverImages.slice(0, 5).map((image, index) => displayRoverImage(image, index))}            
            </div>
        </div>
        <dl>
          <dt>Landing date</dt>
          <dd>${roverInformation.landing_date}</dd>
          <dt>Launch date</dt>
          <dd>${roverInformation.launch_date}</dd>
          <dt>Status</dt>
          <dd>${roverInformation.status}</dd>
        </dl>
    `;
}

function displayRoverImage({src, date}, index) {
    return `
        <div class="slide-${index}">
            <figure>
              <img src="${src}" />
              <figcaption>${date}</figcaption>
            </figure>
        </div>
    `;
}

// ------------------------------------------------------  API CALLS

// Example API call
const getRoverInformation = (state) => {
    let {chosenRover} = state;

    fetch(`http://localhost:3000/rover/${chosenRover}`)
        .then((res) => res.json())
        .then((rover) => {
            const roverImages = rover.photos.map((image) => {
                return {
                    src: image.img_src,
                    date: image.earth_date,
                };
            });
            const roverInformation = rover.photos.find(Boolean).rover;
            updateStore(store, {roverImages, roverInformation});
        });
};
