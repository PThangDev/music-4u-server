// const express = require('express');
const categoryRouter = require('./categoryRouter');
const authRouter = require('./authRouter');
const authorRouter = require('./authorRouter');
const singerRouter = require('./singerRouter');
const songRouter = require('./songRouter');
const albumRouter = require('./albumRouter');
const albumGroupRouter = require('./albumGroupRouter');
const searchRouter = require('./searchRouter');
const routes = [
  categoryRouter,
  authRouter,
  singerRouter,
  authorRouter,
  songRouter,
  albumRouter,
  albumGroupRouter,
  searchRouter,
];

module.exports = routes;
