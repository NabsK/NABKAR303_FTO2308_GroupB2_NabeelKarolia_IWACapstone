import { books, BOOKS_PER_PAGE, authors, genres } from "./data.js";
import { html } from "./view.js";

//Majority of the code pertaining to displaying/previewing data can be found in this file

export const createPreview = ({ author, id, image, title }) => {
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
              <div class="preview__author">${authors[author]}</div>
          </div>
      `;

  return element;
};

/**
 * This function parses information thats used to create the individual tiles
 */
export const createPreviewsFragment = (books, start, end) => {
  const fragment = document.createDocumentFragment();
  const extracted = books.slice(start, end);

  for (const { author, id, image, title } of extracted) {
    const preview = createPreview({
      author,
      id,
      image,
      title,
    });

    fragment.appendChild(preview);
  }

  return fragment;
};

/**
 *code to make book preview pop up
 */
export const dataListItemsHandler = (event) => {
  event.preventDefault();
  const pathArray = Array.from(event.path || event.composedPath());
  let active;

  for (const node of pathArray) {
    if (active) break;
    const previewId = node?.dataset?.preview;

    for (const singleBook of books) {
      if (singleBook.id === previewId) {
        active = singleBook;
        break;
      }
    }
  }

  if (!active) return;

  html.list.active.open = true;
  html.list.blur.src = active.image;
  html.list.image.src = active.image;
  html.list.title.textContent = active.title;

  html.list.subtitle.textContent = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
  html.list.description.textContent = active.description;
};
html.list.items.addEventListener("click", dataListItemsHandler);

export const fragment = document.createDocumentFragment();
export const extracted = books.slice(0, 36);
