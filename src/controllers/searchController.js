const albumModel = require('../models/albumModel');
const songModel = require('../models/songModel');
const singerModel = require('../models/singerModel');
const FeaturesAPI = require('../lib/FeaturesAPI');

const searchController = {
  async search(req, res, next) {
    try {
      const {
        keyword,
        s_limit,
        s_page = 1,
        sg_page = 1,
        sg_limit,
        al_limit,
        al_page = 1,
      } = req.query;

      if (!keyword) {
        return res.status(200).json({
          songs: { data: [], totalPages: null },
          songsOfSingers: {
            data: [],
            totalPages: null,
          },
          singers: { data: [], totalPages: null },
          albums: { data: [], totalPages: null },
        });
      }
      const findQuery = { name: { $regex: keyword, $options: 'i' } };

      const songs = songModel
        .find(findQuery)
        .limit(s_limit)
        .skip(calcSkip(s_limit, s_page))
        .populate({ path: 'singers' })
        .populate({ path: 'categories' })
        .populate({ path: 'albums' });
      const countSongs = songModel.countDocuments(findQuery);

      const singers = singerModel.find(findQuery).limit(sg_limit).skip(calcSkip(sg_limit, sg_page));

      const countSingers = singerModel.countDocuments(findQuery);

      const albums = albumModel
        .find(findQuery)
        .limit(al_limit)
        .skip(calcSkip(al_limit, al_page))
        .populate({ path: 'singers' });

      const countAlbums = albumModel.countDocuments(findQuery);

      const results = await Promise.allSettled([
        songs,
        singers,
        albums,
        countSongs,
        countSingers,
        countAlbums,
      ]);
      const [
        { value: songsData },
        { value: singersData },
        { value: albumsData },
        { value: totalItemSongs },
        { value: totalItemSingers },
        { value: totalItemAlbums },
      ] = results;
      const singerIds = singersData && singersData.reduce((acc, cur) => acc.concat(cur._id), []);
      let singersOfSongs;
      if (!singersData.length && songsData.length) {
        const singerIds = songsData.reduce((acc, cur) => acc.concat(cur.singers), []);
        singersOfSongs = await singerModel.find({ _id: { $in: singerIds } });
      }

      let resultSongsOfSingers = [];
      let songsOfSingersData = [];
      let totalItemSongsOfSingers = 0;
      if (singerIds.length) {
        const findQuery = { singers: { $in: singerIds } };
        const songsOfSingers = songModel
          .find(findQuery)
          .limit(s_limit)
          .skip(calcSkip(s_limit, s_page))
          .populate({ path: 'singers' })
          .populate({ path: 'categories' })
          .populate({ path: 'albums' });
        const countSongsOfSingers = songModel.countDocuments(findQuery);
        resultSongsOfSingers = await Promise.allSettled([songsOfSingers, countSongsOfSingers]);
      }
      if (resultSongsOfSingers.length) {
        [{ value: songsOfSingersData }, { value: totalItemSongsOfSingers }] = resultSongsOfSingers;
      }
      const songsOfSingersDataWithoutSongsData = songsOfSingersData.filter(
        (item) => !songsData.find((s) => s._id === item._id)
      );
      res.status(200).json({
        songs: { data: songsData, totalPages: calcTotalPages(totalItemSongs, s_limit) },
        songsOfSingers: {
          data: songsOfSingersDataWithoutSongsData,
          totalPages: calcTotalPages(totalItemSongsOfSingers, s_limit),
        },
        singersOfSongs,
        singers: { data: singersData, totalPages: calcTotalPages(totalItemSingers, sg_limit) },
        albums: { data: albumsData, totalPages: calcTotalPages(totalItemAlbums, al_limit) },
      });
    } catch (error) {
      next(error);
    }
  },
  async searching(req, res, next) {
    try {
      // const singers = await singerModel.find().pagination().sorting().filtering().search();
      const { keyword } = req.query;
      const findQuery = { name: { $regex: keyword, $options: 'i' } };
      const songsFeature = new FeaturesAPI(
        songModel
          .find(findQuery)
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'authors' })
          .populate({ path: 'categories' })
          .populate({ path: 'albums' }),
        req.query
      )
        .pagination()
        .sorting();

      const albumsFeature = new FeaturesAPI(albumModel.find(findQuery), req.query)
        .pagination()
        .sorting();

      const singersFeature = new FeaturesAPI(singerModel.find(findQuery), req.query)
        .pagination()
        .sorting();

      const results = await Promise.allSettled([
        songsFeature.query,
        albumsFeature.query,
        singersFeature.query,
      ]);
      const [{ value: songsData }, { value: albumsData }, { singersData }] = results;

      const singerIds = singersData && singersData.reduce((acc, cur) => acc.concat(cur._id), []);

      return res.status(200).json({ results });

      // const songsOfSingersFeature = new FeaturesAPI(
      //   songModel
      //     .find({ singers: { $in: singerIds } })
      //     .populate({ path: 'createdBy', select: '-password' })
      //     .populate({ path: 'singers' })
      //     .populate({ path: 'authors' })
      //     .populate({ path: 'categories' })
      //     .populate({ path: 'albums' })
      // )
      //   .pagination()
      //   .sorting()
      //   .filtering()
      //   .searching();
    } catch (error) {
      next(error);
    }
  },
};

const calcSkip = (limit, page) => {
  const _limit = Number(limit);
  const _page = Number(page);
  return _limit * (_page - 1);
};
const calcTotalPages = (totalItems, limit) => {
  const _limit = Number(limit);
  return Math.floor(totalItems / _limit);
};
module.exports = searchController;
