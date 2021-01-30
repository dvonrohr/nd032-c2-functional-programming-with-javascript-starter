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
    getRoverInformation(store, store.get('chosenRover'));
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const Navigation = (state) => {
    return () => {
        return state.get('rovers').map(rover => {
            return `<button onClick="getRoverInformation(store, '${rover}')">${rover}</button>`;
        }).join('');
    }
};

const DisplayRoverInfo = (state) => {
    const roverImages = state.get('roverImages');
    const roverInformation = state.get('roverInformation');

    return () => {
        return `
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
        `;
    }
}

function Slider(roverImagesLimit, roverImages) {
    const limit = roverImages.size < roverImagesLimit ? roverImages.size : roverImagesLimit;
    const images = roverImages.slice(0, limit);
    const imageLinks = new Array(limit).fill(0);

    return function() {
        const imgStructure = images.map(({src, date}, index) => DisplayRoverImage({src, date}, index));
        const imgLinks = imageLinks.map((item, index) => `<a href="#slide-${index + 1}">${index + 1}</a>`);

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

function DisplayRoverImage({src, date}, index) {
    return `
        <div id="slide-${index + 1}">
            <figure>
                <img src="${src}" />
                <figcaption>${date}</figcaption>
            </figure>
        </div>
    `;
}

// ------------------------------------------------------  API CALLS

const getRoverInformation = (state, rover) => {
    fetch(`http://localhost:3000/rover/${rover}`)
        .then((res) => res.json())
        .then((response) => {
            const roverImages = response.latest_photos.map(image => {
                return {
                    src: image.img_src,
                    date: image.earth_date,
                };
            });

            const roverInformation = response.latest_photos.find(Boolean).rover;

            updateStore(state, {
                chosenRover: rover,
                roverImages: Immutable.List(roverImages),
                roverInformation: Immutable.Map(roverInformation)
            })
        });
};
