const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
  splits: { type: Map, of: Number } // only used when custom, key = userId string
});

module.exports = mongoose.model('Expense', ExpenseSchema);
