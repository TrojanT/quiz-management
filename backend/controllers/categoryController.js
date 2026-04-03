const Category = require('../models/Category');
const Quiz = require('../models/Quiz');

const listCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        res.json(
            categories.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                createdAt: c.createdAt,
            }))
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const category = await Category.create({ name: String(name).trim() });
        res.status(201).json({
            id: category.id,
            name: category.name,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const inUse = await Quiz.exists({ category: req.params.id });
        if (inUse) {
            return res.status(400).json({ message: 'Cannot delete category that is used by quizzes' });
        }
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listCategories, createCategory, deleteCategory };
