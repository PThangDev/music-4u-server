const FeaturesAPI = require('../lib/FeaturesAPI');
const songModel = require('../models/songModel');
const albumModel = require('../models/albumModel');
const cloudinary = require('../config/cloudinary');
const createHttpError = require('http-errors');
const slugify = require('slugify');
const clearSpecialStr = require('../lib/clearSpecialStr');
const categoryModel = require('../models/categoryModel');
const singerModel = require('../models/singerModel');
const convertVNtoEN = require('../lib/convertVNtoEN');
const songController = {
  // [GET] /categories
  async getSongs(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const features = new FeaturesAPI(
        songModel
          .find()
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'authors' })
          .populate({ path: 'categories' })
          .populate({ path: 'albums' }),
        req.query
      )
        .pagination()
        .sorting('slug')
        .searching()
        .filtering();
      const [songs, totalItems] = await Promise.allSettled([
        features.query,
        songModel.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: songs.value,
        count: songs.value && songs.value.length,
        totalItems: totalItems.value,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] get song by id
  async getSongById(req, res, next) {
    try {
      const { id } = req.params;
      const song = await songModel.findById(id);
      if (!song) {
        throw createHttpError(404, `Song has id : ${id} does not exist`);
      }
      res.status(200).json({ data: song, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [GET] get song of favorites
  async getSongOfFavorites(req, res, next) {
    try {
      const songs = await songModel
        .find({ _id: req.body })
        .populate({ path: 'createdBy', select: '-password' })
        .populate({ path: 'singers' })
        .populate({ path: 'authors' })
        .populate({ path: 'categories' })
        .populate({ path: 'albums' });
      res.status(200).json({ data: songs });
    } catch (error) {
      next(error);
    }
  },
  async getSongOfCategory(req, res, next) {
    try {
      const { slug } = req.params;
      const { limit } = req.query;
      const category = await categoryModel.findOne({ slug });
      const features = new FeaturesAPI(
        songModel
          .find({ categories: category._id })
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'authors' })
          .populate({ path: 'categories' })
          .populate({ path: 'albums' }),
        req.query
      )
        .pagination()
        .sorting()
        .searching()
        .filtering();
      const [songs, totalItems] = await Promise.allSettled([
        features.query,
        songModel.countDocuments({ categories: category._id }),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));

      // const songs = await songModel.find({categories: category._id})

      return res.status(200).json({
        data: songs.value,
        totalItems: totalItems.value,
        count: songs.value.length,
        message: 'Get songs of category successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  async getSongOfAlbum(req, res, next) {
    try {
      const { slug } = req.params;
      const { limit = 100 } = req.query;

      const album = await albumModel.findOne({ slug });

      if (!album) {
        return res.status(200).json({ data: [] });
      }
      const features = new FeaturesAPI(
        songModel
          .find({ albums: album._id })
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'authors' })
          .populate({ path: 'categories' })
          .populate({ path: 'albums' }),
        req.query
      )
        .pagination()
        .sorting('slug')
        .searching()
        .filtering();
      const [songs, totalItems] = await Promise.allSettled([
        features.query,
        songModel.countDocuments({ albums: album._id }),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: songs.value,
        totalItems: totalItems.value,
        totalPages,
        count: songs.value.length,
        album,
      });
    } catch (error) {
      next(error);
    }
  },
  // [POST] create song
  async createSong(req, res, next) {
    try {
      const { name, singers, authors, singerTxt, categories, albums, lyric, time } = req.body;
      // const { audio, file } = req.files;
      const singersById = await singerModel.find({ _id: singers });

      let singerName = singersById.reduce((acc, cur) => {
        if (acc) {
          return `${acc} ft ${cur.name}`;
        } else {
          return `${cur.name}`;
        }
      }, '');

      const newSongObj = {
        name,
        singers,
        authors,
        singerTxt,
        categories,
        albums,
        lyric,
        time,
        createdBy: req.user._id,
        slug: `${slugify(name, { lower: true, locale: 'vi' })}.${slugify(singerName, {
          lower: true,
          locale: 'vi',
        })}`,
        status: req.user.role === 'admin' ? 'active' : 'pending',
      };
      if (req.body.videoId) {
        newSongObj.videoId = req.body.videoId;
      }
      if (req.body.karaokeId) {
        newSongObj.karaokeId = req.body.karaokeId;
      }

      let result;
      if (req.files) {
        const audioFile = req.files.audio && req.files.audio[0];
        const imageFile = req.files.image && req.files.image[0];
        let audioUpload, imageUpload;
        if (audioFile) {
          audioUpload = cloudinary.v2.uploader.upload(audioFile.path, {
            overwrite: true,
            unique_filename: true,
            public_id: `${name} - ${singerName}-audio`,
            folder: '/musics/Songs/Audios',
            resource_type: 'video',
          });
        }
        if (imageFile) {
          imageUpload = cloudinary.v2.uploader.upload(imageFile.path, {
            overwrite: true,
            unique_filename: true,
            public_id: `${name}-image`,
            folder: '/musics/Songs/Images',
          });
        }

        result = await Promise.allSettled([audioUpload, imageUpload]);
      }
      if (result) {
        const [audioResult, imageResult] = result;
        if (imageResult.value) {
          newSongObj.image = {
            public_id: imageResult.value.public_id,
            secure_url: imageResult.value.secure_url,
          };
        }
        if (audioResult.value) {
          newSongObj.audio = {
            public_id: audioResult.value.public_id,
            secure_url: audioResult.value.secure_url,
          };
        }
      }
      const newSong = new songModel(newSongObj);
      await newSong.save();
      res.status(200).json({ result, data: newSong, message: 'Upload music is successfully' });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update Song
  async updateSong(req, res, next) {
    try {
      const { id } = req.params;
      const { name, singers } = req.body;
      const singersById = await singerModel.find({ _id: singers });
      let singerName = singersById.reduce((acc, cur) => {
        if (acc) {
          return `${acc}_ft_${cur.name}`;
        } else {
          return `${cur.name}`;
        }
      }, '');
      let update = {
        ...req.body,
        slug: `${slugify(name, { lower: true, locale: 'vi' })}.${slugify(singerName, {
          lower: true,
          locale: 'vi',
        })}`,
        createdBy: req.user._id,
      };
      if (req.body.videoId) {
        update.videoId = req.body.videoId;
      }
      if (req.body.karaokeId) {
        update.karaokeId = req.body.karaokeId;
      }
      let audioUpdate, imageUpdate;
      const song = await songModel.findById(id);
      if (!song) {
        throw createHttpError(400, 'Song does not exists');
      }
      // Files upload
      if (req.files) {
        audioFile = req.files.audio && req.files.audio[0];
        imageFile = req.files.image && req.files.image[0];
        //Check audio file upload
        if (audioFile) {
          const option = { resource_type: 'video', unique_filename: true, overwrite: true };
          if (song.audio.public_id) {
            option.public_id = song.audio.public_id;
          } else {
            option.public_id = `${name}-${singerName}-audio`;
            option.folder = '/musics/Songs/Audios';
          }
          audioUpdate = await cloudinary.v2.uploader.upload(audioFile.path, option);
        }
        //Check image file upload
        if (imageFile) {
          const options = {
            overwrite: true,
            unique_filename: true,
          };
          if (song.image.public_id) {
            options.public_id = song.image.public_id;
          } else {
            options.public_id = `${name}-${singerName}-image`;
            options.folder = '/musics/Songs/Images';
          }
          imageUpdate = await cloudinary.v2.uploader.upload(imageFile.path, {
            overwrite: true,
            unique_filename: true,
            public_id: song.image.public_id,
          });
        }
      }
      // const results = await Promise.allSettled([audioFile, imageFile]);
      // if (results) {
      //   audioResult = results[0].value && results[0].value;
      //   imageResult = results[1].value && results[1].value;
      //   console.log(audioResult);
      //   if (audioResult) {
      //     update.audio = {
      //       public_id: audioResult.public_id,
      //       secure_url: audioResult.secure_url,
      //     };
      //   }
      //   if (imageResult) {
      //     console.log(imageResult);
      //     update.image = {
      //       public_id: imageResult.public_id,
      //       secure_url: imageResult.secure_url,
      //     };
      //   }
      // }
      if (imageUpdate) {
        update.image = {
          public_id: imageUpdate.public_id,
          secure_url: imageUpdate.secure_url,
        };
      }
      if (audioUpdate) {
        update.image = {
          public_id: audioUpdate.public_id,
          secure_url: audioUpdate.secure_url,
        };
      }
      const songUpdated = await songModel.findByIdAndUpdate(id, update, { new: true });

      res.status(200).json({ message: 'Update song successfully', data: songUpdated });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update views of song
  async updateViewsOfSong(req, res, next) {
    try {
      const { id } = req.params;
      const song = await songModel.findById(id);
      const songId = await songModel
        .findByIdAndUpdate(id, { views: song.views + 1 }, { new: true })
        .populate({ path: 'createdBy', select: '-password' })
        .populate({ path: 'singers' })
        .populate({ path: 'authors' })
        .populate({ path: 'albums' })
        .populate({ path: 'categories' });
      res.status(200).json({ data: songId, message: 'Update views successfully' });
    } catch (error) {
      next(error);
    }
  },
  async updateSongImage(req, res, next) {
    try {
      const { id } = req.params;
      const song = await songModel.findById(id);
      if (req.files) {
        // console.log(req.files);
        const result = await cloudinary.v2.uploader.upload(req.files.image[0].path, {
          public_id: song.image.public_id,
          unique_filename: true,
          overwrite: true,
        });

        res.json({ result });
      }
    } catch (error) {
      next(error);
    }
  },
  // [DELETE] Delete song by id
  async deleteSong(req, res, next) {
    try {
      const { id } = req.params;
      const song = await songModel.findById(id);
      if (!song) {
        throw createHttpError(400, 'Invalid song id');
      }
      let audioDestroy, imageDestroy;
      if (song.image.public_id) {
        imageDestroy = cloudinary.v2.uploader.destroy(song.image.public_id);
      }
      audioDestroy = cloudinary.v2.uploader.destroy(song.audio.public_id, {
        resource_type: 'video',
      });
      const result = await Promise.allSettled([audioDestroy, imageDestroy]);
      const songDeleted = await songModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Delete song successfully', songDeleted, result });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = songController;
