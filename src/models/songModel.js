const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    name: { type: String, min: 2, max: 20, trim: true, required: true },
    audio: {
      public_id: { type: String, trim: true, default: '' },
      secure_url: { type: String, trim: true },
    },
    image: {
      public_id: {
        type: String,
        trim: true,
        default: '',
      },
      secure_url: {
        type: String,
        trim: true,
        default:
          'https://cdn0.iconfinder.com/data/icons/internet-2020/1080/Applemusicandroid-512.png',
      },
    },
    singers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'singers' }],
    singerTxt: { type: String, trim: true, default: '' },
    authors: [
      { type: mongoose.Schema.Types.ObjectId, default: 'Đang cập nhật...', ref: 'authors' },
    ],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'albums' }],
    time: { type: Date },
    lyric: { type: String, trim: true, default: '' },
    slug: { type: String, unique: true, trim: true, required: true },
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comments' }],
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'auths' }],
    status: { type: String, enum: ['pending', 'active'] },
    videoId: { type: String, trim: true, default: '' },
    karaokeId: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

songSchema.index({ name: 'text' }, { default_language: 'none' });
module.exports = mongoose.model('songs', songSchema);
