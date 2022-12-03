const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, min: 2, max: 20, trim: true, required: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    image: {
      public_id: {
        type: String,
        default: '',
      },
      secure_url: {
        type: String,
        default: 'https://www.melodynest.com/wp-content/uploads/2019/06/SPACE_album-mock.jpg',
      },
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
    singers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'singers' }],
    album_groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'album_groups' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'auths' },
  },
  { timestamps: true }
);

albumSchema.index({ name: 'text' }, { default_language: 'none' });

module.exports = mongoose.model('albums', albumSchema);
