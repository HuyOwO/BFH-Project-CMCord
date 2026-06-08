const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const serverSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  avatar:      { type: String, default: null },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  }],
  inviteCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8) },
}, { timestamps: true });

module.exports = mongoose.model('Server', serverSchema);
