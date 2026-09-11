const db = require('../models/db');

// Create a new test with questions (Admin only)
exports.createTest = async (req, res) => {
  const { title, description, duration_minutes, questions } = req.body;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [testResult] = await connection.query(
      'INSERT INTO tests (title, description, duration_minutes) VALUES (?, ?, ?)',
      [title, description, duration_minutes || null]
    );
    const testId = testResult.insertId;

    if (questions && questions.length > 0) {
      for (let q of questions) {
        await connection.query(
          'INSERT INTO questions (test_id, type, question_text, options, correct_answer, max_marks) VALUES (?, ?, ?, ?, ?, ?)',
          [
            testId,
            q.type || 'general',
            q.question_text,
            q.options ? JSON.stringify(q.options) : null,
            q.correct_answer ? JSON.stringify(q.correct_answer) : null,
            q.max_marks || 10
          ]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Test created successfully', testId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Error creating test' });
  } finally {
    connection.release();
  }
};

// Get all tests (Admin)
exports.getAllTests = async (req, res) => {
  try {
    const [tests] = await db.promise().query('SELECT * FROM tests ORDER BY created_at DESC');
    res.json({ tests });
  } catch (error) {
    console.error('Error getting tests:', error);
    res.status(500).json({ message: 'Error getting tests' });
  }
};

// Get a single test with its questions
exports.getTest = async (req, res) => {
  try {
    const [tests] = await db.promise().query('SELECT * FROM tests WHERE id = ?', [req.params.id]);
    if (tests.length === 0) return res.status(404).json({ message: 'Test not found' });
    
    const [questions] = await db.promise().query('SELECT * FROM questions WHERE test_id = ?', [req.params.id]);
    res.json({ test: tests[0], questions });
  } catch (error) {
    console.error('Error getting test:', error);
    res.status(500).json({ message: 'Error getting test' });
  }
};

// Submit a test (Student)
exports.submitTest = async (req, res) => {
  const { test_id, answers } = req.body;
  const student_id = req.user.id;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM test_submissions WHERE test_id = ? AND student_id = ?', [test_id, student_id]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'You have already submitted this test.' });
    }

    const [subResult] = await connection.query(
      'INSERT INTO test_submissions (test_id, student_id) VALUES (?, ?)',
      [test_id, student_id]
    );
    const submissionId = subResult.insertId;

    for (let ans of answers) {
      await connection.query(
        'INSERT INTO question_answers (submission_id, question_id, student_answer) VALUES (?, ?, ?)',
        [submissionId, ans.question_id, ans.student_answer]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Test submitted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Error submitting test' });
  } finally {
    connection.release();
  }
};

// Admin grades a test submission
exports.gradeSubmission = async (req, res) => {
  const { id } = req.params;
  const { total_score, feedback_summary, graded_answers } = req.body;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'UPDATE test_submissions SET total_score = ?, feedback_summary = ?, status = "graded" WHERE id = ?',
      [total_score, feedback_summary, id]
    );

    if (graded_answers && graded_answers.length > 0) {
      for (let ans of graded_answers) {
        await connection.query(
          'UPDATE question_answers SET marks_awarded = ?, admin_feedback = ? WHERE id = ?',
          [ans.marks_awarded, ans.admin_feedback, ans.id]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Test submission graded successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error grading test submission:', error);
    res.status(500).json({ message: 'Error grading test submission' });
  } finally {
    connection.release();
  }
};

// Get all submissions for a specific test (Admin)
exports.getTestSubmissions = async (req, res) => {
  try {
    const [submissions] = await db.promise().query(
      `SELECT ts.*, u.name as student_name, u.email as student_email, t.title as test_title
       FROM test_submissions ts 
       JOIN users u ON ts.student_id = u.id 
       JOIN tests t ON ts.test_id = t.id
       ORDER BY ts.submitted_at DESC`
    );
    res.json({ submissions });
  } catch (error) {
    console.error('Error getting test submissions:', error);
    res.status(500).json({ message: 'Error getting test submissions' });
  }
};

// Get Student's Submissions (Student)
exports.getStudentSubmissions = async (req, res) => {
  try {
    const [submissions] = await db.promise().query(
      `SELECT ts.*, t.title as test_title 
       FROM test_submissions ts 
       JOIN tests t ON ts.test_id = t.id 
       WHERE ts.student_id = ?
       ORDER BY ts.submitted_at DESC`,
      [req.user.id]
    );
    res.json({ submissions });
  } catch (error) {
    console.error('Error getting student submissions:', error);
    res.status(500).json({ message: 'Error getting student submissions' });
  }
};
