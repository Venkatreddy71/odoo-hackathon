const SalaryStructure = require('../models/SalaryStructure');
const SalaryRule = require('../models/SalaryRule');

// @desc    Get all salary structures
// @route   GET /api/payroll/structures
// @access  Private (ADMIN, PAYROLL_USER)
const getStructures = async (req, res, next) => {
  try {
    const structures = await SalaryStructure.find()
      .populate({
        path: 'rules',
        options: { sort: { sequence: 1 } },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: structures.length, structures });
  } catch (error) {
    next(error);
  }
};

// @desc    Create salary structure
// @route   POST /api/payroll/structures
// @access  Private (ADMIN, PAYROLL_USER)
const createStructure = async (req, res, next) => {
  try {
    const { name, code, description, rules } = req.body;
    const structure = await SalaryStructure.create({ name, code, description, rules: rules || [] });
    const populated = await SalaryStructure.findById(structure._id).populate('rules');
    res.status(201).json({ success: true, structure: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all salary rules
// @route   GET /api/payroll/rules
// @access  Private (ADMIN, PAYROLL_USER)
const getRules = async (req, res, next) => {
  try {
    const rules = await SalaryRule.find().sort({ sequence: 1 });
    res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    next(error);
  }
};

// @desc    Create salary rule
// @route   POST /api/payroll/rules
// @access  Private (ADMIN, PAYROLL_USER)
const createRule = async (req, res, next) => {
  try {
    const rule = await SalaryRule.create(req.body);
    res.status(201).json({ success: true, rule });
  } catch (error) {
    next(error);
  }
};

// @desc    Update salary rule
// @route   PUT /api/payroll/rules/:id
// @access  Private (ADMIN, PAYROLL_USER)
const updateRule = async (req, res, next) => {
  try {
    const rule = await SalaryRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, rule });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStructures,
  createStructure,
  getRules,
  createRule,
  updateRule,
};
