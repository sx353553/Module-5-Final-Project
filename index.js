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
const closeModal = document.querySelector("#close-modal");

document.addEventListener("click", (event) => {
  if (event.target.tagName === "IMG") {
    modalImg.src = event.target.src;
    imageModal.style.display = "flex";
  }
});

closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});
 
