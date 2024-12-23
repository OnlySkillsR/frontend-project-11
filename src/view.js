/* eslint-disable no-undef */
const classes = [
  'list-group-item',
  'd-flex',
  'justify-content-between',
  'align-items-start',
  'border-0',
  'border-end-0'];

const renderForm = (state, elements, i18nextInstance, value) => {
  const { form } = state;
  const { input, sendButton, feedback } = elements;
  if (value === 'processing') {
    input.setAttribute('disabled', '');
    sendButton.setAttribute('disabled', '');
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
    input.classList.remove('is-invalid');
  }
  if (value === 'failed') {
    feedback.textContent = i18nextInstance.t(form.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
  }
};

const loadingRender = (state, elements, i18nextInstance, value) => {
  const { loadingProcess } = state;
  const { feedback, input, sendButton } = elements;
  if (value === 'succsess') {
    feedback.textContent = i18nextInstance.t('successAdd');
    sendButton.removeAttribute('disabled');
    input.removeAttribute('disabled');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    input.value = '';
    input.focus();
  }
  if (value === 'failed') {
    feedback.textContent = i18nextInstance.t(loadingProcess.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
  }
};

const createContent = (title) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  const cardList = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title');
  cardList.classList.add('list-group');
  cardTitle.textContent = title;
  card.append(cardBody, cardList);
  cardBody.append(cardTitle);
  return card;
};

const renderFeed = (state, i18nextInstance, elements) => {
  const { feedsColumn } = elements;
  const { feeds } = state;
  if (!feedsColumn.hasChildNodes()) {
    const card = createContent(i18nextInstance.t('feedsTitle'));
    feedsColumn.append(card);
  }
  const card = feedsColumn.querySelector('.card');
  const list = card.querySelector('ul');
  list.innerHTML = '';
  const items = feeds.map((feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    description.textContent = feed.description;
    item.append(title, description);
    return item;
  });
  list.append(...items);
};

const renderPosts = (state, i18nextInstance, elements) => {
  const { postsColumn } = elements;
  const { ui, posts } = state;
  if (!postsColumn.hasChildNodes()) {
    const card = createContent(i18nextInstance.t('postsTitle'));
    postsColumn.append(card);
  }
  const card = postsColumn.querySelector('.card');
  const list = card.querySelector('ul');
  list.innerHTML = '';
  const items = posts.map((post) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');
    button.textContent = i18nextInstance.t('postButton');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modalWindow';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    item.classList.add(...classes);
    if (ui.seenPosts.has(post.id)) {
      link.classList.add('fw-normal', 'link-secondary');
      link.classList.remove('fw-bold');
    } else {
      link.classList.add('fw-bold');
    }
    link.href = post.link;
    link.textContent = post.title;
    link.setAttribute('target', '_blank');
    item.append(link, button);
    return item;
  });
  list.append(...items);
};

const renderModal = (state, elements) => {
  const { modal } = elements;
  const { posts, ui } = state;
  const title = modal.querySelector('.modal-title');
  const description = modal.querySelector('.modal-body');
  const linkButton = modal.querySelector('.modal-footer a');
  const openedPost = posts.find((post) => post.id === ui.id);
  title.textContent = openedPost.title;
  description.textContent = openedPost.description;
  linkButton.setAttribute('href', openedPost.link);
};

export default (state, i18nextInstance, elements) => (path, value) => {
  if (path === 'form.status') {
    renderForm(state, elements, i18nextInstance, value);
  }
  if (path === 'loadingProcess.status') {
    loadingRender(state, elements, i18nextInstance, value);
  }
  if (path === 'feeds') {
    renderFeed(state, i18nextInstance, elements);
  }
  if (path === 'posts') {
    renderPosts(state, i18nextInstance, elements);
  }
  if (path === 'ui.seenPosts') {
    renderModal(state, elements);
    renderPosts(state, i18nextInstance, elements);
  }
};
