const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content:  { type: String, default: '' },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel:  { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  fileUrl:  { type: String, default: null },
  fileType: { type: String, default: null },
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
