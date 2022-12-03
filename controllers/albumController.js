const FeaturesAPI = require('../lib/FeaturesAPI');
const albumModel = require('../models/albumModel');
const songModel = require('../models/songModel');
const cloudinary = require('../config/cloudinary');
const createHttpError = require('http-errors');
const slugify = require('slugify');
const albumGroupModel = require('../models/albumGroupModel');
const categoryModel = require('../models/categoryModel');
const albumController = {
  // [GET] /albums
  async getAlbums(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const features = new FeaturesAPI(
        albumModel
          .find()
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'album_groups' })
          .populate({ path: 'categories' }),
        req.query
      )
        .pagination()
        .sorting()
        .searching()
        .filtering();
      const [albums, totalItems] = await Promise.allSettled([
        features.query,
        albumModel.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: albums.value,
        count: albums.value.length,
        totalItems: totalItems.value,
        totalPages,
        message: 'Get albums successfully!',
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] /albums of category
  async getAlbumsOfCategory(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const { slug } = req.params;

      const category = await categoryModel.findOne({ slug });
      if (!category) {
        return res.status(200).json({ data: [] });
      }
      const features = new FeaturesAPI(
        albumModel
          .find({ categories: category._id })
          .populate({ path: 'createdBy', select: '-password' })
          .populate({ path: 'singers' })
          .populate({ path: 'album_groups' })
          .populate({ path: 'categories' }),
        req.query
      )
        .pagination()
        .sorting()
        .searching()
        .filtering();
      const [albums, totalItems] = await Promise.allSettled([
        features.query,
        albumModel.countDocuments({ categories: category._id }),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: albums.value,
        count: albums.value.length,
        totalItems: totalItems.value,
        totalPages,
        message: 'Get albums of category successfully!',
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] /albums/album_groups
  async getAlbumsByAlbumGroupSlug(req, res, next) {
    try {
      const { album_groups } = req.body;
      let promiseAlbums = [];
      album_groups.forEach((alg) => {
        const features = new FeaturesAPI(
          albumModel
            .find({ album_groups: alg[Object.keys(alg)[0]] })
            .populate({ path: 'createdBy', select: '-password' })
            .populate({ path: 'singers' })
            .populate({ path: 'album_groups' })
            .populate({ path: 'categories' }),
          req.query
        )
          .pagination()
          .sorting()
          .searching()
          .filtering();
        promiseAlbums.push(features.query);
      });
      const result = await Promise.allSettled(promiseAlbums);
      const data = album_groups.map((alg, index) => {
        return {
          [Object.keys(alg)[0]]: result[index].value,
        };
      });
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },
  async getAlbumsOfAlbumGroup(req, res, next) {
    try {
      const { slug } = req.params;
      const albumGroup = await albumGroupModel.findOne({ slug });
      if (!albumGroup) {
        res.status(200).json({ data: [] });
      }
      const features = new FeaturesAPI(
        albumModel
          .find({ album_groups: albumGroup._id })
          .populate({ path: 'singers' })
          .populate({ path: 'album_groups' }),
        req.query
      )
        .pagination()
        .sorting()
        .searching()
        .filtering();

      const [albums, totalItems] = await Promise.allSettled([
        features.query,
        albumModel.countDocuments({ album_groups: albumGroup._id }),
      ]);

      res.status(200).json({
        data: albums.value,
        totalItems: totalItems.value,
        count: albums.value.length,
        message: `Albums has album group slug ${slug}`,
        albumGroup,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] album by slug
  async getAlbumBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const album = await albumModel.findOne({ slug });
      if (!album) {
        throw createHttpError(404, `Album has id: ${id} does not exist`);
      }
      res.status(200).json({ data: album, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [GET] album by id
  async getAlbumById(req, res, next) {
    try {
      const { id } = req.params;
      const album = await albumModel.findById(id);
      if (!album) {
        throw createHttpError(404, `Album has id: ${id} does not exist`);
      }
      res.status(200).json({ data: album, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [POST] create album
  async createAlbum(req, res, next) {
    try {
      const { name, singers, categories, album_groups } = req.body;
      let result;
      const newAlbumObj = {
        name,
        singers,
        categories,
        album_groups,
        slug: slugify(name, { lower: true, locale: 'vi' }),

        createdBy: req.user._id,
      };
      if (req.file) {
        // console.log(convertVNtoEN(req.file.originalname));

        result = await cloudinary.v2.uploader.upload(req.file.path, {
          overwrite: true,
          unique_filename: true,
          public_id: name,
          folder: 'musics/albums',
        });
      }
      if (result) {
        newAlbumObj.image = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      const newAlbum = new albumModel(newAlbumObj);
      await newAlbum.save();
      res.status(201).json({ data: newAlbum, message: 'Create a new album is successfully!' });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update category
  async updateAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const { name, singers, album_groups, categories } = req.body;
      let result,
        update = {
          name,
          singers,
          album_groups,
          categories,
          slug: slugify(name, { lower: true, locale: 'vi' }),
        };
      const album = await albumModel.findById(id);
      if (!album) {
        throw createHttpError(400, 'album does not exists');
      }
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, {
          public_id: album.image.public_id,
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
      const albumUpdated = await albumModel.findByIdAndUpdate(id, update, { new: true });
      res.status(200).json({ message: 'Update album successfully', data: albumUpdated });
    } catch (error) {
      next(error);
    }
  },
  async deleteAlbum(req, res, next) {
    try {
      const { id } = req.params;
      let result;
      const album = await albumModel.findById(id);
      if (!album) {
        throw createHttpError(400, 'Invalid album id');
      }
      if (album.image.public_id) {
        result = await cloudinary.v2.uploader.destroy(album.image.public_id);
      }
      const albumDeleted = await albumModel.findByIdAndDelete(id);
      const songsDeleteAlbum = await songModel.updateMany(
        { albums: id },
        { $pull: { albums: id } }
      );
      res.status(200).json({ message: 'Delete album successfully', albumDeleted });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = albumController;
