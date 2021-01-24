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
    console.log('state', newState);
    render(root, store);
};

const render = async (root, state) => {
    root.innerHTML = App(state);

    document.querySelectorAll("[data-load]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const chosenRover = event.target.dataset.load;
            updateStore(state, { chosenRover })
        });
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
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
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
    return rovers.map(
        (rover) => `<button data-load="${rover}">${rover}</button>`
    );
};

// Example of a pure function that renders infomation requested from the backend
const displayRoverInfo = (roverImages, roverInformation, chosenRover) => {
    const hasRover = chosenRover !== roverInformation?.name;

    // if state has not current rover informations, fetch them
    if (!roverInformation?.name || chosenRover !== roverInformation?.name) {
        getRoverInformation(store);
    }
    console.log(roverImages.slice(0, 1));

    return `
        <h2>${roverInformation.name}</h2>
        <div>
            ${roverImages.slice(0,5).map(image => displayRoverImage(image))}
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

function displayRoverImage({src, date}) {
    return `
        <figure>
          <img src="${src}" />
          <figcaption>${date}</figcaption>
        </figure>
    `;
}

// ------------------------------------------------------  API CALLS

// Example API call
const getRoverInformation = (state) => {
    let { chosenRover } = state;

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
