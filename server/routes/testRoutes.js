const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public/Student routes
router.get('/', authMiddleware, testController.getAllTests);
router.get('/:id', authMiddleware, testController.getTest);
router.post('/submit', authMiddleware, testController.submitTest);
router.get('/student/submissions', authMiddleware, testController.getStudentSubmissions);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, testController.createTest);
router.get('/admin/submissions', authMiddleware, adminMiddleware, testController.getTestSubmissions);
router.put('/submissions/:id', authMiddleware, adminMiddleware, testController.gradeSubmission);

module.exports = router;
