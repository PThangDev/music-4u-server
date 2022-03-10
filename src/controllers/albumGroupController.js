const FeaturesAPI = require('../lib/FeaturesAPI');
const albumModel = require('../models/albumModel');
const cloudinary = require('../config/cloudinary');
const createHttpError = require('http-errors');
const slugify = require('slugify');
const albumGroupModel = require('../models/albumGroupModel');
const albumGroupController = {
  // [GET] /albums
  async getAlbumGroups(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const features = new FeaturesAPI(
        albumGroupModel.find().populate({ path: 'createdBy', select: '-password' }),
        req.query
      )
        .pagination()
        .sorting()
        .searching()
        .filtering();
      const [albumGroups, totalItems] = await Promise.allSettled([
        features.query,
        albumGroupModel.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: albumGroups.value,
        totalItems: totalItems.value,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] album_group by id
  async getAlbumGroupById(req, res, next) {
    try {
      const { id } = req.params;
      const albumGroup = await albumGroupModel.findById(id);
      if (!albumGroup) {
        throw createHttpError(404, `Album group has id: ${id} does not exist`);
      }
      res.status(200).json({ data: albumGroup, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [POST] create album
  async createAlbumGroup(req, res, next) {
    try {
      const { name } = req.body;
      const newAlbumObj = {
        name,
        slug: slugify(name, { lower: true, locale: 'vi' }),

        createdBy: req.user._id,
      };

      const newAlbumGroup = new albumGroupModel(newAlbumObj);
      await newAlbumGroup.save();
      res
        .status(201)
        .json({ data: newAlbumGroup, message: 'Create a new album group  successfully!' });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update category
  async updateAlbumGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      let result,
        update = {
          name,
          slug: slugify(name, { lower: true, locale: 'vi' }),
        };
      const category = await albumModel.findById(id);
      if (!category) {
        throw createHttpError(400, 'Category does not exists');
      }
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, {
          public_id: category.image.public_id,
          overwrite: true,
          unique_filename: true,
        });
      }
      if (result) {
        update.image = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      const categoryUpdated = await albumModel.findByIdAndUpdate(id, update, { new: true });
      res.status(200).json({ message: 'Update category successfully', data: categoryUpdated });
    } catch (error) {
      next(error);
    }
  },
  async deleteAlbumGroup(req, res, next) {
    try {
      const { id } = req.params;
      let result;
      const category = await albumModel.findById(id);
      if (!category) {
        throw createHttpError(400, 'Invalid category id');
      }
      if (category.image.public_id) {
        result = await cloudinary.v2.uploader.destroy(category.image.public_id);
      }
      const categoryDeleted = await albumModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Delete category successfully', categoryDeleted });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = albumGroupController;
