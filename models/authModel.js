const mongoose = require('mongoose');
const authSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('auths', authSchema);
