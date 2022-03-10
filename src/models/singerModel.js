const mongoose = require('mongoose');

const singerSchema = new mongoose.Schema(
  {
    name: { type: String, min: 2, max: 25, trim: true, required: true, unique: true },
    avatar: {
      public_id: {
        type: String,
        trim: true,
        default: '',
      },
      secure_url: {
        type: String,
        trim: true,
        default:
          'https://res.cloudinary.com/dbfyyqmwr/image/upload/v1617707300/football-news/avatars/default_avatar.png',
      },
    },
    profile: { type: String, trim: true, default: '' },
    dob: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' },
    slug: { type: String, trim: true, unique: true, required: true },
  },
  { timestamps: true }
);
singerSchema.index({ name: 'text' }, { default_language: 'none' });

module.exports = mongoose.model('singers', singerSchema);
