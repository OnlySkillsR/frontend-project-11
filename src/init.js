/* eslint-disable no-undef */
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import * as _ from 'lodash';
import view from './view.js';
import ru from './locales/ru.js';
import parsingHtml from './parser.js';
import UrlConstructor from './urlConstructor.js';

const state = {
  form: {
    status: '',
    error: '',
  },
  loadingProcess: {
    status: '',
    error: '',
  },
  ui: {
    id: null,
    seenPosts: new Set(),
  },
  feeds: [],
  posts: [],
};

const axiosConfig = {
  timeout: 10000,
};

const errorExtraction = (error) => {
  if (error.isAxiosError) {
    return 'errorNetwork';
  }
  if (error.isParserError) {
    return 'errorResourceNotValid';
  }
  return 'errorUnknown';
};

const checkNewPosts = (checkedState) => {
  const { feeds } = checkedState;
  const promises = feeds.map((feed) => axios.get(UrlConstructor(feed.url), axiosConfig)
    .then((response) => {
      const { posts } = parsingHtml(response.data.contents);
      const newPosts = posts
        .filter((post) => !checkedState.posts.some((item) => item.title === post.title));
      checkedState.posts.unshift(...newPosts);
    })
    .catch(() => {}));
  Promise.all(promises)
    .then(() => {
      setTimeout(() => checkNewPosts(checkedState), 5000);
    });
};

const loading = (checkedState, url) => {
  const { loadingProcess } = checkedState;
  axios.get(UrlConstructor(url), axiosConfig)
    .then((response) => {
      const { feed, posts } = parsingHtml(response.data.contents);
      feed.id = _.uniqueId();
      feed.url = url;
      const relatedPosts = posts.map((post) => ({
        ...post,
        feedId: feed.id,
      }));
      loadingProcess.status = 'succsess';
      checkedState.feeds.unshift(feed);
      checkedState.posts.unshift(...relatedPosts);
    })
    .catch((e) => {
      loadingProcess.error = errorExtraction(e);
      loadingProcess.status = 'failed';
    });
};

const validate = (url, urls) => {
  const schema = yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urls, 'errorNowUnique');
  return schema
    .validate(url)
    .then(() => { })
    .catch((e) => e);
};

export default (() => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
  };
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    debug: true,
    lng: 'ru',
    resources: {
      ru,
    },
  }).then(() => {
    const checkedState = onChange(state, view(state, i18nextInstance, elements));
    elements.form.addEventListener('submit', ((event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const url = data.get('url');
      checkedState.form.status = 'processing';
      const urls = checkedState.feeds.map((feed) => feed.url);
      validate(url, urls).then((error) => {
        if (error) {
          checkedState.form.error = error.message;
          checkedState.form.status = 'failed';
          return;
        }
        checkedState.form.error = '';
        loading(checkedState, url);
      });
    }));
    elements.postsColumn.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      event.preventDefault();
      if (id) {
        checkedState.ui.id = id;
        checkedState.ui.seenPosts.add(id);
      }
    });
    checkNewPosts(checkedState);
  });
});
