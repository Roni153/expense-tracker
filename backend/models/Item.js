const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String }
});

module.exports = mongoose.model('Item', ItemSchema);
