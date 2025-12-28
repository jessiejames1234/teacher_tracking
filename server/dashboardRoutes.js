// server/dashboardRoutes.js
import express from 'express';
import pool from './db.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const queries = [
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_departments'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_programs'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_sections'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_semesters'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_subject'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_subject_offerings'),
      pool.query('SELECT COUNT(*) AS cnt FROM tbl_rooms'),
      pool.query("SELECT COUNT(*) AS cnt FROM tbl_users WHERE role_id = 5 AND status = 1"),
    ];

    const results = await Promise.all(queries);

    const total_departments = results[0][0][0].cnt || 0;
    const total_programs = results[1][0][0].cnt || 0;
    const total_sections = results[2][0][0].cnt || 0;
    const total_semesters = results[3][0][0].cnt || 0;
    const total_subjects = results[4][0][0].cnt || 0;
    const total_offerings = results[5][0][0].cnt || 0;
    const total_rooms = results[6][0][0].cnt || 0;
    const total_teachers = results[7][0][0].cnt || 0;

    // attendance today stats
    const [presentRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 2 OR flag_check_id = 2 OR flag_out_id = 2)`
    );
    const [absentRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 3 OR flag_check_id = 3 OR flag_out_id = 3)`
    );
    const [lateRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 5 OR flag_check_id = 5 OR flag_out_id = 5)`
    );

    const summary = {
      total_departments,
      total_programs,
      total_sections,
      total_semesters,
      total_subjects,
      total_offerings,
      total_rooms,
      total_teachers,
      attendance_today: {
        present: presentRows[0].cnt || 0,
        absent: absentRows[0].cnt || 0,
        late: lateRows[0].cnt || 0,
      },
    };

    res.json(summary);
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// GET /api/dashboard/full -> returns summary + lists + recent attendance for dashboard visualizations
router.get('/dashboard/full', async (req, res) => {
  try {
    // reuse summary counts
    const [deptRows] = await pool.query('SELECT dept_id, dept_name FROM tbl_departments ORDER BY dept_name');
    const [progRows] = await pool.query('SELECT program_id, program_name FROM tbl_programs ORDER BY program_name');
    const [secRows] = await pool.query('SELECT section_id, section_name FROM tbl_sections ORDER BY section_name');
    const [semRows] = await pool.query('SELECT semester_id, term, start_date, end_date FROM tbl_semesters ORDER BY start_date DESC');
    const [subjRows] = await pool.query('SELECT subject_id, subject_code, subject_name FROM tbl_subject ORDER BY subject_code');
    const [offRows] = await pool.query(`
      SELECT so.offering_id, so.semester_id, so.section_id, so.subject_id, so.user_id,
             s.subject_code, s.subject_name, sec.section_name
      FROM tbl_subject_offerings so
      LEFT JOIN tbl_subject s ON so.subject_id = s.subject_id
      LEFT JOIN tbl_sections sec ON so.section_id = sec.section_id
      ORDER BY s.subject_code, sec.section_name
    `);
    const [roomRows] = await pool.query('SELECT room_id, room_name, latitude, longitude, radius FROM tbl_rooms ORDER BY room_name');
    const [teacherRows] = await pool.query('SELECT user_id, first_name, last_name FROM tbl_users WHERE role_id = 5 AND status = 1 ORDER BY last_name, first_name');

    // recent attendance (last 20 rows)
    const [recentRows] = await pool.query(`
      SELECT
        ar.attendance_id,
        ar.user_id,
        ar.schedule_id,
        ar.room_id,
        DATE_FORMAT(ar.date, '%Y-%m-%d') AS date,
        ar.time_in,
        ar.latitude_in,
        ar.longitude_in,
        ar.flag_in_id,
        ar.time_check,
        ar.latitude_check,
        ar.longitude_check,
        ar.flag_check_id,
        ar.time_out,
        ar.flag_out_id,
        u.first_name,
        u.last_name,
        cs.start_time,
        cs.end_time,
        r.room_name,
        s.subject_code,
        s.subject_name,
        ft.flag_name AS flag_in_name
      FROM tbl_attendance_records ar
      LEFT JOIN tbl_users u ON ar.user_id = u.user_id
      LEFT JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
      LEFT JOIN tbl_rooms r ON ar.room_id = r.room_id
      LEFT JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id
      LEFT JOIN tbl_subject s ON so.subject_id = s.subject_id
      LEFT JOIN tbl_flag_types ft ON ar.flag_in_id = ft.flag_id
      ORDER BY ar.date DESC, ar.attendance_id DESC
      LIMIT 20
    `);

    // lightweight summary counts (reuse earlier logic)
    const [counts] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM tbl_departments) AS total_departments,
         (SELECT COUNT(*) FROM tbl_programs) AS total_programs,
         (SELECT COUNT(*) FROM tbl_sections) AS total_sections,
         (SELECT COUNT(*) FROM tbl_semesters) AS total_semesters,
         (SELECT COUNT(*) FROM tbl_subject) AS total_subjects,
         (SELECT COUNT(*) FROM tbl_subject_offerings) AS total_offerings,
         (SELECT COUNT(*) FROM tbl_rooms) AS total_rooms,
         (SELECT COUNT(*) FROM tbl_users WHERE role_id = 5 AND status = 1) AS total_teachers
       `
    );

    // attendance today breakdown
    const [presentRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 2 OR flag_check_id = 2 OR flag_out_id = 2)`
    );
    const [absentRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 3 OR flag_check_id = 3 OR flag_out_id = 3)`
    );
    const [lateRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tbl_attendance_records WHERE DATE(date) = CURDATE() AND (flag_in_id = 5 OR flag_check_id = 5 OR flag_out_id = 5)`
    );

    const summary = {
      total_departments: counts[0].total_departments || 0,
      total_programs: counts[0].total_programs || 0,
      total_sections: counts[0].total_sections || 0,
      total_semesters: counts[0].total_semesters || 0,
      total_subjects: counts[0].total_subjects || 0,
      total_offerings: counts[0].total_offerings || 0,
      total_rooms: counts[0].total_rooms || 0,
      total_teachers: counts[0].total_teachers || 0,
      attendance_today: {
        present: presentRows[0].cnt || 0,
        absent: absentRows[0].cnt || 0,
        late: lateRows[0].cnt || 0,
      }
    };

    res.json({ summary, departments: deptRows, programs: progRows, sections: secRows, semesters: semRows, subjects: subjRows, offerings: offRows, rooms: roomRows, teachers: teacherRows, recent_attendance: recentRows });
  } catch (err) {
    console.error('Error fetching dashboard full data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
