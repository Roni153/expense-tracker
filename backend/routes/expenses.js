const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Item = require('../models/Item');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  const expenses = await Expense.find().populate('payer', 'name photo').populate('item', 'name unit').sort('-date');
  res.json(expenses);
});

router.post('/', protect, async (req, res) => {
  let { date, payerId, itemId, newItemName, newItemUnit, quantity = 1, amount, splitType = 'equal', splits } = req.body;

  if (!payerId || !amount) return res.status(400).json({ message: 'Missing fields' });

  const members = await User.find();
  if (!members.find(m => m._id.toString() === payerId)) return res.status(400).json({ message: 'Invalid payer' });

  let item;
  if (itemId) {
    item = await Item.findById(itemId);
  } else if (newItemName) {
    item = await Item.create({ name: newItemName, unit: newItemUnit });
  } else {
    return res.status(400).json({ message: 'Item required' });
  }

  if (splitType === 'custom') {
    if (!splits || typeof splits !== 'object') return res.status(400).json({ message: 'Splits required for custom' });
    const sum = Object.values(splits).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - amount) > 0.01) return res.status(400).json({ message: 'Splits must equal total amount' });
  }

  const expense = await Expense.create({
    date: date ? new Date(date) : new Date(),
    payer: payerId,
    item: item._id,
    quantity,
    amount,
    splitType,
    splits: splitType === 'custom' ? splits : undefined
  });

  await expense.populate('payer', 'name photo');
  await expense.populate('item', 'name unit');
  res.json(expense);
});

// Balances, item stats, settlements
router.get('/balances', protect, async (req, res) => {
  const users = await User.find();
  const expenses = await Expense.find();

  const result = users.map(u => ({
    id: u._id,
    name: u.name,
    photo: u.photo,
    totalPaid: 0,
    balance: 0
  }));

  const map = Object.fromEntries(result.map(r => [r.id.toString(), r]));

  expenses.forEach(exp => {
    const n = users.length;
    users.forEach(u => {
      const share = exp.splitType === 'equal' ? exp.amount / n : (exp.splits?.get(u._id.toString()) || 0);
      map[u._id].balance -= share;
    });
    map[exp.payer.toString()].totalPaid += exp.amount;
    map[exp.payer.toString()].balance += exp.amount;
  });

  res.json(Object.values(map));
});

router.get('/itemstats', protect, async (req, res) => {
  const expenses = await Expense.find().populate('item', 'name');
  const stats = {};

  expenses.forEach(exp => {
    if (exp.item) {
      const key = exp.item.name;
      if (!stats[key]) stats[key] = { item: key, totalSpent: 0, totalQuantity: 0 };
      stats[key].totalSpent += exp.amount;
      stats[key].totalQuantity += exp.quantity;
    }
  });

  res.json(Object.values(stats).sort((a, b) => b.totalSpent - a.totalSpent));
});

router.get('/settlements', protect, async (req, res) => {
  const users = await User.find();
  const expenses = await Expense.find();

  const balanceMap = {};
  users.forEach(u => balanceMap[u._id] = { name: u.name, balance: 0 });

  expenses.forEach(exp => {
    const n = users.length;
    users.forEach(u => {
      const share = exp.splitType === 'equal' ? exp.amount / n : (exp.splits?.get(u._id.toString()) || 0);
      balanceMap[u._id].balance -= share;
    });
    balanceMap[exp.payer].balance += exp.amount;
  });

  const debtors = [];
  const creditors = [];
  users.forEach(u => {
    const b = balanceMap[u._id].balance;
    if (b < -0.01) debtors.push({ id: u._id, name: u.name, amount: -b });
    else if (b > 0.01) creditors.push({ id: u._id, name: u.name, amount: b });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({
      from: debtors[i].id,
      fromName: debtors[i].name,
      to: creditors[j].id,
      toName: creditors[j].name,
      amount: Math.round(pay * 100) / 100
    });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  res.json(settlements);
});

module.exports = router;
