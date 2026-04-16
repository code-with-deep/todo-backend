import express from 'express';
import Todo from '../models/Todo.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const search = req.query.search || '';
    const completed = req.query.completed;

    const filter = { user: req.user.id };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (completed === 'true') filter.isCompleted = true;
    if (completed === 'false') filter.isCompleted = false;

    const total = await Todo.countDocuments(filter);
    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      todos,
      page,
      pages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load todos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load todo' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const todo = await Todo.create({
      title,
      description: description || '',
      user: req.user.id
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

router.patch('/mark-all-complete', async (req, res) => {
  try {
    await Todo.updateMany({ user: req.user.id }, { isCompleted: true });
    res.json({ message: 'All todos completed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todos' });
  }
});

export default router;
