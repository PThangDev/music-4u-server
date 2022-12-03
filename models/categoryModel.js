const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 2,
      max: 20,
      trim: true,
      required: true,
      unique: true,
    },
    image: {
      public_id: {
        type: String,
        default: '',
      },
      secure_url: {
        type: String,
        default: 'https://photo-zmp3.zadn.vn/cover/8/0/4/7/8047a5134646835763068f7439e17f2b.jpg',
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' },
    slug: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);
categorySchema.index({ name: 'text' }, { default_language: 'none' });

module.exports = mongoose.model('categories', categorySchema);
// model<ICategory>()
