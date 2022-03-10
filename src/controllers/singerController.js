const FeaturesAPI = require('../lib/FeaturesAPI');
const singerModel = require('../models/singerModel');
const cloudinary = require('../config/cloudinary');
const createHttpError = require('http-errors');
const slugify = require('slugify');
const authorModel = require('../models/authorModel');
const singerController = {
  // [GET] /singers
  async getSingers(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const features = new FeaturesAPI(
        singerModel.find().populate({ path: 'createdBy', select: '-password' }),
        req.query
      )
        .pagination()
        // .sort()
        .sorting()
        .searching()
        .filtering();
      const [singers, totalItems] = await Promise.allSettled([
        features.query,
        singerModel.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: singers.value,
        totalItems: totalItems.value,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] singer by id
  async getSingerById(req, res, next) {
    try {
      const { id } = req.params;
      const singer = await singerModel.findById(id);
      if (!singer) {
        throw createHttpError(404, `Singer has id: ${id} does not exist`);
      }
      res.status(200).json({ data: singer, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [GET] singer by slug
  async getSingerBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const singer = await singerModel.findOne({ slug });
      if (!singer) {
        throw createHttpError(404, `Singer has id: ${id} does not exist`);
      }
      res.status(200).json({ data: singer, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [POST] create singer
  async createSinger(req, res, next) {
    try {
      const { name, profile, isAuthor } = req.body;
      let result;
      const newSingerObj = {
        name,
        profile,
        slug: slugify(name, { lower: true, locale: 'vi' }),
        createdBy: req.user._id,
      };
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, {
          overwrite: true,
          unique_filename: true,
          public_id: name,
          folder: 'musics/Singers',
        });
      }
      if (result) {
        newSingerObj.avatar = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      const newSinger = new singerModel(newSingerObj);
      await newSinger.save();
      // If singer is author
      if (isAuthor) {
        const author = await authorModel.findById(newSinger._id);
        if (!author) {
          const newAuthor = new authorModel({ ...newSinger._doc });
          await newAuthor.save();
        }
      }
      res.status(201).json({ data: newSinger, message: 'Create a new singer is successfully!' });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update singer
  async updateSinger(req, res, next) {
    try {
      const { id } = req.params;
      const { name, profile, dob } = req.body;
      let result,
        update = {
          name,
          profile,
          dob,
          slug: slugify(name, { lower: true, locale: 'vi' }),
        };
      const singer = await singerModel.findById(id);
      if (!singer) {
        throw createHttpError(400, 'Singer does not exists');
      }
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, {
          public_id: singer.avatar.public_id,
          overwrite: true,
          unique_filename: true,
          folder: '/musics/singers',
        });
      }
      if (result) {
        update.avatar = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      const singerUpdated = await singerModel.findByIdAndUpdate(id, update, { new: true });
      res.status(200).json({ message: 'Update singer successfully', data: singerUpdated });
    } catch (error) {
      next(error);
    }
  },
  async deleteSinger(req, res, next) {
    try {
      const { id } = req.params;
      let result;
      const singer = await singerModel.findById(id);
      if (!singer) {
        throw createHttpError(400, 'Invalid singer id');
      }
      if (singer.avatar.public_id) {
        result = await cloudinary.v2.uploader.destroy(singer.avatar.public_id);
      }
      const singerDeleted = await singerModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Delete singer successfully', singerDeleted });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = singerController;
