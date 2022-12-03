const mongoose = require('mongoose');

const albumGroupSchema = new mongoose.Schema(
  {
    name: { type: String, min: 2, max: 20, trim: true, required: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'auths' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('album_groups', albumGroupSchema);
