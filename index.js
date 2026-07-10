const sortFilter = document.querySelector("#sort-filter");
const locationList = document.querySelector("#location-list");

const originalItems = Array.from(locationList.querySelectorAll("li"));

sortFilter.addEventListener("change", () => {
  let items = [...originalItems];

  if (sortFilter.value === "city-az") {
    items.sort((a, b) => {
      const cityA = a.textContent.split(",")[0].trim();
      const cityB = b.textContent.split(",")[0].trim();
      return cityA.localeCompare(cityB);
    });
  }

  if (sortFilter.value === "city-za") {
    items.sort((a, b) => {
      const cityA = a.textContent.split(",")[0].trim();
      const cityB = b.textContent.split(",")[0].trim();
      return cityB.localeCompare(cityA);
    });
  }

  if (sortFilter.value === "country-az") {
    items.sort((a, b) => {
      const countryA = a.textContent.split(",")[1].trim();
      const countryB = b.textContent.split(",")[1].trim();
      return countryA.localeCompare(countryB);
    });
  }

  locationList.innerHTML = "";
  items.forEach((item) => locationList.appendChild(item));
});

const imageModal = document.querySelector("#image-modal");
const modalImg = document.querySelector("#modal-img");
const modalTitle = document.querySelector("#modal-title");
const closeModal = document.querySelector("#close-modal");

document.addEventListener("click", (event) => {
  if (
    event.target.classList.contains("destination-img") ||
    event.target.classList.contains("popup-image")
  ) {
    modalImg.src = event.target.src;
    modalTitle.textContent = event.target.alt;
    imageModal.style.display = "flex";
  }
});

closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});

// ---- GeoDB Cities API integration ----

const GEODB_API_KEY = "8c18d32e81msh1587537ceb326f0p196753jsn26d39defc0e4"; // <-- paste your RapidAPI key here
const GEODB_HOST = "wft-geo-db.p.rapidapi.com";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCityData(rawQuery) {
  // People naturally type "City, Country" — GeoDB only knows the city
  // name itself, so drop anything after the first comma before searching.
  const cityName = rawQuery.split(",")[0].trim();

  const url = `https://${GEODB_HOST}/v1/geo/cities?namePrefix=${encodeURIComponent(
    cityName
  )}&limit=1&sort=-population`;

  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": GEODB_API_KEY,
      "X-RapidAPI-Host": GEODB_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`GeoDB request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

// Feature 1: search box lets the user look up ANY city and drop a pin
const citySearchInput = document.querySelector("#city-search-input");
const citySearchBtn = document.querySelector("#city-search-btn");
const citySearchStatus = document.querySelector("#city-search-status");

let searchMarker = null;

citySearchBtn.addEventListener("click", async () => {
  const query = citySearchInput.value.trim();

  if (!query) {
    citySearchStatus.textContent = "Type a city name first.";
    return;
  }

  citySearchStatus.textContent = "Searching...";

  try {
    const city = await fetchCityData(query);

    if (!city) {
     citySearchStatus.textContent = `No results for "${query}". Double-check the spelling and try again.`;
      return;
    }

    const { city: cityName, country, region, latitude, longitude, population } = city;

    if (searchMarker) {
      window.map.removeLayer(searchMarker);
    }

    searchMarker = L.marker([latitude, longitude], { icon: window.redIcon }).addTo(window.map).bindPopup(`
      <b>${cityName}, ${country}</b><br>
      ${region ? region + "<br>" : ""}
      Population: ${population ? population.toLocaleString() : "N/A"}
    `);

    window.map.setView([latitude, longitude], 8);
    searchMarker.openPopup();
    citySearchStatus.textContent = `Showing ${cityName}, ${country}.`;
  } catch (error) {
    console.error(error);
    citySearchStatus.textContent =
     "Something went wrong with that search. Please try again.";
  }
});

// Feature 2: enrich the existing 12 destination popups with live population data
async function enrichDestinationsWithPopulation() {
  if (!window.countries) return;

  for (const country of window.countries) {
    try {
      const cityQuery = country.name.split(",")[0].trim();
      const cityData = await fetchCityData(cityQuery);

      if (cityData && cityData.population) {
        const popupContent = `
          <b>${country.name}</b><br>
          <img src="${country.imgUrl}" alt="${country.name}" style="width: 100px; height: auto;"><br>
          Population: ${cityData.population.toLocaleString()}
        `;
        country.marker.setPopupContent(popupContent);
      }
    } catch (error) {
      console.error(`Could not fetch population for ${country.name}:`, error);
    }

    await delay(300); // spread requests out to respect GeoDB's rate limit
  }
}

enrichDestinationsWithPopulation();
