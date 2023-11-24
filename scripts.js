import { books, BOOKS_PER_PAGE, authors, genres } from "./data.js";
import { html } from "./view.js";
import { createPreview, createPreviewsFragment, dataListItemsHandler, fragment, extracted } from "./preview.js";

const MATCHES = books;
const RANGE = [0, 36];

//css value for theme
const day = {
  dark: "10, 10, 20",
  light: "255, 255, 255",
};
const night = {
  dark: "255, 255, 255",
  light: "10, 10, 20",
};
const css = { day, night };

const actions = {
  list: {
    updateRemaining: () => {
      let remaining = MATCHES.length - page * BOOKS_PER_PAGE;
      document.querySelector("[data-list-button]").disabled = remaining < 0;
      document.querySelector("[data-list-button]").innerHTML = /* html */ `
                <span>Show more <span style="opacity: 0.5;">(${remaining})</span></span>
            `;
    },
  },
};

let page = 1;

if (!books && !Array.isArray(books)) throw new Error("Source required");
if (!RANGE && RANGE.length < 2) throw new Error("RANGE must be an array with two numbers");

//displays books on main screen
for (const { author, image, title, id } of extracted) {
  const preview = createPreview({
    author,
    id,
    image,
    title,
  });

  fragment.appendChild(preview);
}

//search genre filter list
html.list.items.appendChild(fragment);

const genresFragment = document.createDocumentFragment();

let element = document.createElement("option");
element.value = "any";
element.innerText = "All Genres";
genresFragment.appendChild(element);

for (const [id, name] of Object.entries(genres)) {
  element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  genresFragment.appendChild(element);
}
html.search.genres.appendChild(genresFragment);

//search author filter list
const authorsFragment = document.createDocumentFragment();
element = document.createElement("option");
element.value = "any";
element.innerText = "All Authors";
authorsFragment.appendChild(element);

for (const [id, name] of Object.entries(authors)) {
  element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  authorsFragment.appendChild(element);
}
html.search.authors.appendChild(authorsFragment);

html.list.button.disabled = !(MATCHES.length - page * BOOKS_PER_PAGE > 0);

html.list.button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> ${MATCHES.length - page * BOOKS_PER_PAGE > 0 ? MATCHES.length - page * BOOKS_PER_PAGE : 0}</span>
`;

const dataSearchCancelHandler = (event) => {
  html.search.overlay.open = false;
};
html.search.cancel.addEventListener("click", dataSearchCancelHandler);

const dataCloseListHandler = (event) => {
  html.list.active.open = false;
};
html.list.close.addEventListener("click", dataCloseListHandler);

//show more button logic - extends page
document.querySelector("[data-list-button]").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("[data-list-items]").appendChild(createPreviewsFragment(books, page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE));
  page = page + 1;
  actions.list.updateRemaining();
});

//open search overlay
const headerSearchHandler = (event) => {
  event.preventDefault();
  html.search.overlay.open = true;
  html.search.title.focus();
};
html.header.search.addEventListener("click", headerSearchHandler);

//open settings overlay
const headerSettingsHandler = (event) => {
  event.preventDefault();
  html.settings.overlay.open = true;
};
html.header.settings.addEventListener("click", headerSettingsHandler);

//search filter logic
document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = [];

  for (const book of MATCHES) {
    const titleMatch = filters.title.trim() === "" || book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch = filters.author === "any" || book.author === filters.author;
    let genreMatch = filters.genre === "any";

    for (const genre of book.genres) {
      if (genre === filters.genre) {
        genreMatch = true;
        break;
      }
    }

    if (titleMatch && authorMatch && genreMatch) {
      result.push(book);
    }
  }

  if (result.length < 1) {
    html.list.message.classList.add("list__message_show");
  } else {
    html.list.message.classList.remove("list__message_show");
  }

  document.querySelector("[data-list-items]").innerHTML = /* html */ `
      <div class="list__message" data-list-message>

  `;

  const fragment = document.createDocumentFragment();
  const extracted = result.slice(RANGE[0], RANGE[1]);

  for (const { author, image, title, id } of extracted) {
    const authorId = author;

    let element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = /* html */ `
          <img
              class="preview__image"
              src="${image}"
          />
          
          <div class="preview__info">
              <h3 class="preview__title">${title}</h3>
              <div class="preview__author">${authors[authorId]}</div>
          </div>
      `;

    fragment.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(fragment);
  let initial = result.length - page * BOOKS_PER_PAGE;
  let remaining = initial > 0 ? initial : 0;
  document.querySelector("[data-list-button]").disabled = initial <= 0;

  document.querySelector("[data-list-button]").innerHTML = /* html */ `
      <span>Show more</span>
      <span class="list__remaining"> (${remaining})</span>
  `;

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("[data-search-overlay]").open = false;
});

// Theme
//change theme
const dataSettingsHandler = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const result = Object.fromEntries(formData);
  document.documentElement.style.setProperty("--color-dark", css[result.theme].dark);
  document.documentElement.style.setProperty("--color-light", css[result.theme].light);
  html.settings.overlay.open = false;
};
html.settings.overlay.addEventListener("submit", dataSettingsHandler);

//cancel theme setting choice
const dataSettingsCancelHandler = (event) => {
  html.settings.overlay.open = false;
  html.settings.cancel.submit;
};
html.settings.cancel.addEventListener("click", dataSettingsCancelHandler);
