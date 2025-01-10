const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed'] },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Task', TaskSchema);
