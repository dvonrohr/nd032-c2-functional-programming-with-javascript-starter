let store = Immutable.Map({
    chosenRover: 'Curiosity',
    roverImages: Immutable.List([]),
    roverInformation: Immutable.Map({}),
    rovers: Immutable.List(["Curiosity", "Opportunity", "Spirit"]),
});

const root = document.getElementById("root");

const updateStore = (store, state) => {
    const newState = store.merge(state);
    render(root, newState);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
};

// create content
const App = (state) => {
    const navigationRenderer = Navigation(state);
    const roverRenderer = DisplayRoverInfo(state);

    return `
        <main>
            <nav>
              ${navigationRenderer()} 
            </nav>
            <section>
                <div class="content">
                    ${roverRenderer()}
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

const Navigation = (state) => {
    const chosenRover = state.get('chosenRover');

    document.body.addEventListener('click', (event) => {
        event.preventDefault();
        const rover = event.target.dataset?.load;
        if (rover !== chosenRover) {
            if (chosenRover) updateStore(state, {chosenRover: rover});
        }
    });

    return () => {
        return state.get('rovers').map(rover => {
            return `<button data-load="${rover}">${rover}</button>`;
        }).join('');
    }
};

const DisplayRoverInfo = (state) => {
    const roverImages = state.get('roverImages');
    const roverInformation = state.get('roverInformation');
    const chosenRover = state.get('chosenRover');

    return () => {
        // if state has not current rover informations, fetch them
        if (!roverInformation.get('name') || chosenRover !== roverInformation.get('name')) {
            getRoverInformation(store);
        }

        return `
            <div>
                ${Slider(5, roverImages)()}
                <div class="card">
                    <div class="card-heading">
                    <h2>${roverInformation.get('name')}</h2>
                    <p>Details about the rover.</p>
                </div>
                <div class="card-content">
                    <dl>
                        <div class="dl-section">
                            <dt>Landing date</dt>
                            <dd>${roverInformation.get('landing_date')}</dd>
                        </div>
                        <div class="dl-section">
                            <dt>Launch date</dt>
                            <dd>${roverInformation.get('launch_date')}</dd>                    
                        </div>
                        <div class="dl-section">
                            <dt>Status</dt>
                            <dd>${roverInformation.get('status')}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    `;
    }
}

function Slider(roverImagesLimit, roverImages) {
    const images = roverImages.slice(0, roverImagesLimit);
    const imageLinks = new Array(roverImagesLimit);

    return function() {
        const imgStructure = images.map((image, index) => DisplayRoverImage(image, index));
        const imgLinks = imageLinks.map(number => `<a href="#slide-${number}">${number}</a>`);

        return `
        <div class="slider">
            <div class="slides">
                ${imgStructure.join('')}
            </div>
                <div class="slider-nav">
                ${imgLinks.join('')}
            </div>
        </div>
    `;
    }
}

function DisplayRoverImage(image, index) {
    return `
        <div id="slide-${index + 1}">
            <figure>
              <img src="${image.get('src')}" />
              <figcaption>${image.get('date')}</figcaption>
            </figure>
        </div>
    `;
}

// ------------------------------------------------------  API CALLS

const getRoverInformation = (state) => {
    const chosenRover = state.get('chosenRover');

    fetch(`http://localhost:3000/rover/${chosenRover}`)
        .then((res) => res.json())
        .then((response) => {
            const roverImages = response.latest_photos.map((image) => {
                return {
                    src: image.img_src,
                    date: image.earth_date,
                };
            });

            const roverInformation = response.latest_photos.find(Boolean).rover;
            updateStore(state, {roverImages, roverInformation})
        });
};
