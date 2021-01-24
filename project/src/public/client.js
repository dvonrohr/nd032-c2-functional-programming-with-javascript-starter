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
        <main>
            <nav>
              ${Navigation(store.rovers)} 
            </nav>
            <section>
                <div class="content">
                    ${displayRoverInfo(roverImages, roverInformation, chosenRover)}
                </div>
            </section>
        </main>
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
        <div class="slider">
            <div class="slides">
                ${roverImages.slice(0, 5).map((image, index) => displayRoverImage(image, index))}            
            </div>
                <div class="slider-nav">
                    ${[1, 2, 3, 4, 5,].map(number => {
                        return `<a href="#slide-${number}">${number}</a>`;
                    }).join('')}
            </div>
        </div>
        <div class="card">
            <div class="card-heading">
                <h2>${roverInformation.name}</h2>
                <p>Details about the rover.</p>
            </div>
            <div class="card-content">
                <dl>
                    <div class="dl-section">
                        <dt>Landing date</dt>
                        <dd>${roverInformation.landing_date}</dd>
                    </div>
                    <div class="dl-section">
                        <dt>Launch date</dt>
                        <dd>${roverInformation.launch_date}</dd>                    
                    </div>
                    <div class="dl-section">
                        <dt>Status</dt>
                        <dd>${roverInformation.status}</dd>
                    </div>
                </dl>
            </div>
        </div>
    `;
}

function displayRoverImage({src, date}, index) {
    return `
        <div id="slide-${index+1}">
            <figure>
              <img src="${src}" />
              <figcaption>${date}</figcaption>
            </figure>
        </div>
    `;
}

// ------------------------------------------------------  API CALLS

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
