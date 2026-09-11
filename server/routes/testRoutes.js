const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public/Student routes
router.get('/', protect, testController.getAllTests);
router.get('/:id', protect, testController.getTest);
router.post('/submit', protect, testController.submitTest);
router.get('/student/submissions', protect, testController.getStudentSubmissions);

// Admin routes
router.post('/', protect, adminOnly, testController.createTest);
router.get('/admin/submissions', protect, adminOnly, testController.getTestSubmissions);
router.put('/submissions/:id', protect, adminOnly, testController.gradeSubmission);

module.exports = router;
