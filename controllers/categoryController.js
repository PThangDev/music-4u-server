const FeaturesAPI = require('../lib/FeaturesAPI');
const categoryModel = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');
const createHttpError = require('http-errors');
const slugify = require('slugify');
const songModel = require('../models/songModel');
const categoryController = {
  // [GET] /categories
  async getCategories(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      const features = new FeaturesAPI(
        categoryModel.find().populate({ path: 'createdBy', select: '-password' }),
        req.query
      )
        .pagination()
        .sorting()
        .filtering()
        .searching();

      const [categories, totalItems] = await Promise.allSettled([
        features.query,
        categoryModel.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalItems.value / parseInt(limit));
      res.status(200).json({
        data: categories.value,
        totalItems: totalItems.value,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] category by id
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoryModel.findById(id);
      if (!category) {
        throw createHttpError(404, `Category has id: ${id} does not exist`);
      }
      res.status(200).json({ data: category, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [GET] category by slug
  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await categoryModel.findOne({ slug });
      if (!category) {
        throw createHttpError(404, `Category has id: ${id} does not exist`);
      }
      res.status(200).json({ data: category, message: '' });
    } catch (error) {
      next(error);
    }
  },
  // [POST] create category
  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      let result;
      const newCategoryObj = {
        name,
        slug: slugify(name, { lower: true }),
        createdBy: req.user._id,
      };
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, {
          overwrite: true,
          unique_filename: true,
          public_id: name,
          folder: 'musics/Categories',
        });
      }
      if (result) {
        newCategoryObj.image = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      const newCategory = new categoryModel(newCategoryObj);
      await newCategory.save();
      res
        .status(201)
        .json({ data: newCategory, message: 'Create a new category is successfully!' });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] update category
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      let result,
        update = {
          name,
          slug: slugify(name, { lower: true }),
        };
      const category = await categoryModel.findById(id);
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
      const categoryUpdated = await categoryModel.findByIdAndUpdate(id, update, { new: true });
      res.status(200).json({ message: 'Update category successfully', data: categoryUpdated });
    } catch (error) {
      next(error);
    }
  },
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      let result;
      const category = await categoryModel.findById(id);
      if (!category) {
        throw createHttpError(400, 'Invalid category id');
      }
      if (category.image.public_id) {
        result = await cloudinary.v2.uploader.destroy(category.image.public_id);
      }
      const categoryDeleted = await categoryModel.findByIdAndDelete(id);
      // const songUpdated = await songModel.find({ categories: id  });
      res.status(200).json({ message: 'Delete category successfully', categoryDeleted });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = categoryController;
