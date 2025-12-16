// index.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';   // ✅ Required!
import pool from './db.js';
import locationsRouter from './locationsRoutes.js'; // ⬅️ NEW
import cron from 'node-cron';


function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Returns distance in meters between two lat/lon points.
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


const app = express();

app.use(cors());
app.use(express.json());

// mount location-related APIs under /api
app.use('/api', locationsRouter);



// GET roles only
app.get('/api/roles', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT role_id, role_name FROM tbl_roles ORDER BY role_id'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// GET users (no status join)
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.user_id,
         u.first_name,
         u.last_name,
         u.email,
         u.contact_no,
         r.role_name,
         u.status   -- numeric status (1 = active)
       FROM tbl_users u
       JOIN tbl_roles r ON u.role_id = r.role_id
       ORDER BY u.user_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST create new user
app.post('/api/users', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      contact_no,
      role_id,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !role_id
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // status defaults to 1 in DB
    const [result] = await pool.query(
      `INSERT INTO tbl_users 
         (role_id, first_name, last_name, email, password_hash, contact_no)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [role_id, first_name, last_name, email, password_hash, contact_no || '']
    );

    res.status(201).json({
      user_id: result.insertId,
      first_name,
      last_name,
      email,
      role_id,
      contact_no,
      status: 1,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing email or password" });

    const [users] = await pool.query(
      `SELECT user_id, role_id, first_name, last_name, email, password_hash 
       FROM tbl_users 
       WHERE email = ? LIMIT 1`,
      [email]
    );

    if (users.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role_id: user.role_id,
      },
      "your-secret-key",
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});









// === CLASS SCHEDULES API ===

// Get list of rooms for dropdown
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT room_id, room_name, latitude, longitude, radius FROM tbl_rooms ORDER BY room_name'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get list of subject offerings for dropdown
// Label: "ITE202 - BSITE1-01" etc.
app.get('/api/offerings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         so.offering_id,
         s.subject_code,
         s.subject_name,
         sec.section_name
       FROM tbl_subject_offerings so
       JOIN tbl_subject s   ON so.subject_id = s.subject_id
       JOIN tbl_sections sec ON so.section_id = sec.section_id
       ORDER BY s.subject_code, sec.section_name`
    );
    // Return the full rows so frontend can access subject_code, subject_name, section_name
    res.json(rows);
  } catch (err) {
    console.error('Error fetching offerings:', err);
    res.status(500).json({ error: 'Failed to fetch offerings' });
  }
});

// GET all class schedules (no date column)
app.get('/api/class-schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        cs.schedule_id,
        cs.room_id,
        cs.offering_id,
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        r.room_name,
        s.subject_code,
        s.subject_name,
        sec.section_name
      FROM tbl_class_schedules cs
      JOIN tbl_rooms r              ON cs.room_id = r.room_id
      JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id
      JOIN tbl_subject s            ON so.subject_id = s.subject_id
      JOIN tbl_sections sec         ON so.section_id = sec.section_id
      ORDER BY cs.day_of_week, cs.start_time
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching class schedules:', err);
    res.status(500).json({ error: 'Failed to fetch class schedules' });
  }
});


// Create new class schedule
// POST create new class schedule (no date)
app.post('/api/class-schedules', async (req, res) => {
  try {
    const { room_id, offering_id, day_of_week, start_time, end_time } = req.body;

    if (!room_id || !offering_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO tbl_class_schedules (
        room_id,
        offering_id,
        day_of_week,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?)
    `,
      [room_id, offering_id, day_of_week, start_time, end_time]
    );

    res.status(201).json({
      schedule_id: result.insertId,
      room_id,
      offering_id,
      day_of_week,
      start_time,
      end_time,
    });
  } catch (err) {
    console.error('Error creating class schedule:', err);
    res.status(500).json({ error: 'Failed to create class schedule' });
  }
});





// LIST attendance records with optional filters
// GET /api/attendance?date=YYYY-MM-DD&status=present|absent|NA|excuse&teacher_id=6
// LIST attendance records with optional filters
// GET /api/attendance?date=YYYY-MM-DD&status=present|absent|NA|excuse&teacher_id=6
app.get('/api/attendance', async (req, res) => {
  try {
    const { date, status, teacher_id } = req.query;

    let sql = `
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
        ar.latitude_out,
        ar.longitude_out,
        ar.flag_out_id,
        u.first_name,
        u.last_name,
        cs.start_time,
        cs.end_time,
        r.room_name,
        s.subject_code,
        s.subject_name,
        sec.section_name,
        ft.flag_name AS status_name

      FROM tbl_attendance_records ar
      JOIN tbl_users u              ON ar.user_id = u.user_id
      JOIN tbl_class_schedules cs   ON ar.schedule_id = cs.schedule_id
      JOIN tbl_rooms r              ON ar.room_id = r.room_id
      JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id
      JOIN tbl_subject s            ON so.subject_id = s.subject_id
      JOIN tbl_sections sec         ON so.section_id = sec.section_id
      JOIN tbl_flag_types ft        ON ar.flag_in_id = ft.flag_id
    `;

    const where = [];
    const params = [];

    if (date) {
      where.push('ar.date = ?');
      params.push(date);
    }

    if (status) {
      where.push('ft.flag_name = ?');
      params.push(status);
    }

    if (teacher_id) {
      where.push('ar.user_id = ?');
      params.push(teacher_id);
    }

    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    sql += ' ORDER BY ar.date DESC, cs.start_time, u.last_name, u.first_name';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});


// GET list of teachers (for filter dropdown)
app.get('/api/teachers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         user_id,
         first_name,
         last_name
       FROM tbl_users
       WHERE role_id = 5   -- 5 = teacher
         AND status = 1    -- active only
       ORDER BY last_name, first_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});


// Helper: generate attendance records for a 7-day window
async function generateAttendanceWeek(start_date, end_date) {
  // Optional custom range from body: { start_date, end_date } in 'YYYY-MM-DD'
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultStart = new Date(today);
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 6); // 7-day window

  const parseDate = (str, fallback) => {
    if (!str) return new Date(fallback);
    const d = new Date(str);
    if (isNaN(d.getTime())) return new Date(fallback);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const rangeStart = parseDate(start_date, defaultStart);
  const rangeEnd = parseDate(end_date, defaultEnd);

  if (rangeEnd < rangeStart) {
    const err = new Error("end_date must be >= start_date");
    err.code = "BAD_RANGE";
    throw err;
  }

  // Load schedules with teacher + semester window
  const [rows] = await pool.query(`
    SELECT
      cs.schedule_id,
      cs.room_id,
      cs.day_of_week,
      so.user_id      AS teacher_id,
      sem.start_date,
      sem.end_date
    FROM tbl_class_schedules cs
    JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id
    JOIN tbl_semesters sem        ON so.semester_id = sem.semester_id
  `);

  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  let totalInserted = 0;

  for (const row of rows) {
    const {
      schedule_id,
      room_id,
      day_of_week,
      teacher_id,
      start_date: semStartStr,
      end_date: semEndStr,
    } = row;

    const targetDow = dayMap[day_of_week];
    if (targetDow === undefined) continue;

    // Semester window
    const semStart = new Date(semStartStr);
    const semEnd = new Date(semEndStr);
    semStart.setHours(0, 0, 0, 0);
    semEnd.setHours(0, 0, 0, 0);

    // Effective window = intersection of [rangeStart, rangeEnd] and [semStart, semEnd]
    const effStart = new Date(Math.max(rangeStart.getTime(), semStart.getTime()));
    const effEnd = new Date(Math.min(rangeEnd.getTime(), semEnd.getTime()));

    if (effEnd < effStart) continue; // no overlap

    // Loop each day in effective window, generate when day matches day_of_week
    for (let d = new Date(effStart); d <= effEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== targetDow) continue;

      const dateStr = formatDate(d);

      const [result] = await pool.query(
        `
        INSERT INTO tbl_attendance_records (
          user_id,
          schedule_id,
          room_id,
          date,
          flag_in_id,
          flag_check_id,
          flag_out_id
        )
        SELECT ?, ?, ?, ?, 1, 1, 1
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1
          FROM tbl_attendance_records
          WHERE user_id = ?
            AND schedule_id = ?
            AND date = ?
        )
      `,
        [
          teacher_id,
          schedule_id,
          room_id,
          dateStr,
          teacher_id,
          schedule_id,
          dateStr,
        ]
      );

      totalInserted += result.affectedRows || 0;
    }
  }

  return {
    inserted: totalInserted,
    rangeStart: rangeStart.toISOString().slice(0, 10),
    rangeEnd: rangeEnd.toISOString().slice(0, 10),
  };
}


// Generate attendance_records for a 7-day window (this week by default)
app.post('/api/attendance/generate-week', async (req, res) => {
  try {
    const { start_date, end_date } = req.body || {};

    const result = await generateAttendanceWeek(start_date, end_date);

    res.json({
      ok: true,
      message: "Weekly attendance generation complete.",
      inserted: result.inserted,
      rangeStart: result.rangeStart,
      rangeEnd: result.rangeEnd,
    });
  } catch (err) {
    console.error("Error generating weekly attendance:", err);

    if (err.code === "BAD_RANGE") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: "Failed to generate weekly attendance" });
  }
});




// POST /api/attendance/check-in
// Body: { schedule_id, user_id, date: 'YYYY-MM-DD', latitude, longitude }
app.post('/api/attendance/check-in', async (req, res) => {
  try {
    const { schedule_id, user_id, date, latitude, longitude } = req.body;

    if (!schedule_id || !user_id || !date) {
      return res
        .status(400)
        .json({ error: 'schedule_id, user_id, and date are required' });
    }

    // 1) Load attendance row + schedule + room
    const [rows] = await pool.query(
      `
      SELECT
        ar.attendance_id,
        ar.date,
        cs.start_time,
        cs.end_time,
        r.latitude AS room_lat,
        r.longitude AS room_lon,
        r.radius AS room_radius
      FROM tbl_attendance_records ar
      JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
      JOIN tbl_rooms r              ON ar.room_id = r.room_id
      WHERE ar.schedule_id = ?
        AND ar.user_id = ?
        AND ar.date = ?
      LIMIT 1
    `,
      [schedule_id, user_id, date]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          'No attendance row found for this schedule/date (run attendance generator first).',
      });
    }

    const row = rows[0];

    // 2) GPS distance check (user must be within room radius)
    if (latitude != null && longitude != null) {
      const dist = getDistanceMeters(
        Number(latitude),
        Number(longitude),
        Number(row.room_lat),
        Number(row.room_lon)
      );

      if (dist > row.room_radius) {
        return res.status(400).json({
          error: `You are outside the allowed classroom radius (${Math.round(
            row.room_radius
          )}m). Current distance ≈ ${Math.round(dist)}m.`,
        });
      }
    }

    // 3) Time-based flag_in logic
    const now = new Date();

    // Build "class start" Date using provided date + DB time
    const classStart = new Date(`${row.date}T${row.start_time}`); // server local time
    const diffMinutes = (now.getTime() - classStart.getTime()) / (1000 * 60);

    // 15-minute rule:
    // - > 15 minutes late → flag_in_id = 5 (late)
    // - <= 15 minutes after start AND not earlier than -15 minutes → present
    // - < -15 minutes → too early, do not allow check-in
    if (diffMinutes < -15) {
      return res.status(400).json({
        error: 'Check-in window is not yet open (more than 15 minutes early).',
      });
    }

    let newFlagIn = 2; // present
    if (diffMinutes > 15) {
      newFlagIn = 5; // late
    }

    const [result] = await pool.query(
      `
        UPDATE tbl_attendance_records
        SET time_in = NOW(),
            latitude_in = ?,
            longitude_in = ?,
            flag_in_id = ?
        WHERE attendance_id = ?
      `,
      [latitude || null, longitude || null, newFlagIn, row.attendance_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Failed to update attendance record for check-in.' });
    }

    res.json({
      ok: true,
      message:
        newFlagIn === 2
          ? 'Check-in recorded as PRESENT.'
          : 'Check-in recorded as LATE.',
      flag_in_id: newFlagIn,
    });
  } catch (err) {
    console.error('Error on check-in:', err);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
});





// POST /api/attendance/mid-check
// Body: { schedule_id, user_id, date, latitude, longitude }
app.post('/api/attendance/mid-check', async (req, res) => {
  try {
    const { schedule_id, user_id, date, latitude, longitude } = req.body;

    if (!schedule_id || !user_id || !date) {
      return res
        .status(400)
        .json({ error: 'schedule_id, user_id, and date are required' });
    }

    const [rows] = await pool.query(
      `
      SELECT
        ar.attendance_id,
        ar.date,
        cs.start_time,
        cs.end_time,
        r.latitude AS room_lat,
        r.longitude AS room_lon,
        r.radius AS room_radius
      FROM tbl_attendance_records ar
      JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
      JOIN tbl_rooms r              ON ar.room_id = r.room_id
      WHERE ar.schedule_id = ?
        AND ar.user_id = ?
        AND ar.date = ?
      LIMIT 1
    `,
      [schedule_id, user_id, date]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          'No attendance row found for this schedule/date (run attendance generator first).',
      });
    }

    const row = rows[0];

    // Distance from room
    let newFlagCheck = 3; // default: absent
    if (latitude != null && longitude != null) {
      const dist = getDistanceMeters(
        Number(latitude),
        Number(longitude),
        Number(row.room_lat),
        Number(row.room_lon)
      );

      if (dist > row.room_radius) {
        newFlagCheck = 3; // absent
      } else {
        newFlagCheck = 2; // present
      }
    }

    const [result] = await pool.query(
      `
        UPDATE tbl_attendance_records
        SET time_check = NOW(),
            latitude_check = ?,
            longitude_check = ?,
            flag_check_id = ?
        WHERE attendance_id = ?
      `,
      [latitude || null, longitude || null, newFlagCheck, row.attendance_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Failed to update attendance record for mid-check.' });
    }

    res.json({
      ok: true,
      message:
        newFlagCheck === 2
          ? 'Mid-class check recorded as PRESENT.'
          : 'Mid-class check recorded as ABSENT (outside room radius).',
      flag_check_id: newFlagCheck,
    });
  } catch (err) {
    console.error('Error on mid-check:', err);
    res.status(500).json({ error: 'Failed to record mid-check' });
  }
});



// POST /api/attendance/check-out
// Body: { schedule_id, user_id, date, latitude, longitude }
app.post('/api/attendance/check-out', async (req, res) => {
  try {
    const { schedule_id, user_id, date, latitude, longitude } = req.body;

    if (!schedule_id || !user_id || !date) {
      return res
        .status(400)
        .json({ error: 'schedule_id, user_id, and date are required' });
    }

    const [rows] = await pool.query(
      `
      SELECT
        ar.attendance_id,
        ar.date,
        ar.time_in,
        ar.time_check,
        ar.flag_in_id,
        ar.flag_check_id,
        cs.start_time,
        cs.end_time,
        r.latitude AS room_lat,
        r.longitude AS room_lon,
        r.radius AS room_radius
      FROM tbl_attendance_records ar
      JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
      JOIN tbl_rooms r              ON ar.room_id = r.room_id
      WHERE ar.schedule_id = ?
        AND ar.user_id = ?
        AND ar.date = ?
      LIMIT 1
    `,
      [schedule_id, user_id, date]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          'No attendance row found for this schedule/date (run attendance generator first).',
      });
    }

    const row = rows[0];

    // If teacher never attended at all (flag_in still NA and no times),
    // treat as ABSENT on flag_out.
    const neverAttended =
      row.flag_in_id === 1 &&
      !row.time_in &&
      !row.time_check &&
      row.flag_check_id === 1;

    let newFlagOut = 3; // absent by default

    if (!neverAttended && latitude != null && longitude != null) {
      const dist = getDistanceMeters(
        Number(latitude),
        Number(longitude),
        Number(row.room_lat),
        Number(row.room_lon)
      );

      if (dist <= row.room_radius) {
        newFlagOut = 2; // present at end of class
      } else {
        newFlagOut = 3; // outside room radius → absent at end
      }
    }

    const [result] = await pool.query(
      `
        UPDATE tbl_attendance_records
        SET time_out = NOW(),
            latitude_out = ?,
            longitude_out = ?,
            flag_out_id = ?
        WHERE attendance_id = ?
      `,
      [latitude || null, longitude || null, newFlagOut, row.attendance_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Failed to update attendance record for check-out.' });
    }

    res.json({
      ok: true,
      message:
        newFlagOut === 2
          ? 'Check-out recorded as PRESENT at end of class.'
          : 'Teacher marked ABSENT at end of class.',
      flag_out_id: newFlagOut,
      neverAttended,
    });
  } catch (err) {
    console.error('Error on check-out:', err);
    res.status(500).json({ error: 'Failed to record check-out' });
  }
});














// === ACADEMIC MANAGEMENT ENDPOINTS ===

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT dept_id, dean_id, dept_name FROM tbl_departments ORDER BY dept_name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { dept_name, dean_id } = req.body;
    if (!dept_name) return res.status(400).json({ error: 'Missing dept_name' });
    const [result] = await pool.query('INSERT INTO tbl_departments (dept_name, dean_id) VALUES (?, ?)', [dept_name, dean_id || null]);
    res.status(201).json({ dept_id: result.insertId, dept_name, dean_id: dean_id || null });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Programs
app.get('/api/programs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.program_id, p.head_id, p.dept_id, p.program_name, d.dept_name
      FROM tbl_programs p
      JOIN tbl_departments d ON p.dept_id = d.dept_id
      ORDER BY d.dept_name, p.program_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

app.post('/api/programs', async (req, res) => {
  try {
    const { program_name, dept_id, head_id } = req.body;
    if (!program_name || !dept_id) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO tbl_programs (program_name, dept_id, head_id) VALUES (?, ?, ?)', [program_name, dept_id, head_id || null]);
    res.status(201).json({ program_id: result.insertId, program_name, dept_id, head_id: head_id || null });
  } catch (err) {
    console.error('Error creating program:', err);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// Sections
app.get('/api/sections', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sec.section_id, sec.program_id, sec.section_name, p.program_name
      FROM tbl_sections sec
      JOIN tbl_programs p ON sec.program_id = p.program_id
      ORDER BY p.program_name, sec.section_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sections:', err);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

app.post('/api/sections', async (req, res) => {
  try {
    const { program_id, section_name } = req.body;
    if (!program_id || !section_name) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO tbl_sections (program_id, section_name) VALUES (?, ?)', [program_id, section_name]);
    res.status(201).json({ section_id: result.insertId, program_id, section_name });
  } catch (err) {
    console.error('Error creating section:', err);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Semesters
app.get('/api/semesters', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT semester_id, session_id, term, DATE_FORMAT(start_date, "%Y-%m-%d") AS start_date, DATE_FORMAT(end_date, "%Y-%m-%d") AS end_date FROM tbl_semesters ORDER BY start_date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching semesters:', err);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
});

app.post('/api/semesters', async (req, res) => {
  try {
    const { session_id, term, start_date, end_date } = req.body;
    if (!term || !start_date || !end_date) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO tbl_semesters (session_id, term, start_date, end_date) VALUES (?, ?, ?, ?)', [session_id || null, term, start_date, end_date]);
    res.status(201).json({ semester_id: result.insertId, session_id: session_id || null, term, start_date, end_date });
  } catch (err) {
    console.error('Error creating semester:', err);
    res.status(500).json({ error: 'Failed to create semester' });
  }
});

// Subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT subject_id, program_id, subject_code, subject_name FROM tbl_subject ORDER BY subject_code');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { program_id, subject_code, subject_name } = req.body;
    if (!program_id || !subject_code || !subject_name) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO tbl_subject (program_id, subject_code, subject_name) VALUES (?, ?, ?)', [program_id, subject_code, subject_name]);
    res.status(201).json({ subject_id: result.insertId, program_id, subject_code, subject_name });
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Subject Offerings
app.get('/api/subject-offerings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT so.offering_id, so.semester_id, so.section_id, so.subject_id, so.user_id,
             s.subject_code, s.subject_name, sec.section_name, sem.term
      FROM tbl_subject_offerings so
      JOIN tbl_subject s ON so.subject_id = s.subject_id
      JOIN tbl_sections sec ON so.section_id = sec.section_id
      JOIN tbl_semesters sem ON so.semester_id = sem.semester_id
      ORDER BY sem.start_date DESC, s.subject_code
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching subject offerings:', err);
    res.status(500).json({ error: 'Failed to fetch subject offerings' });
  }
});

app.post('/api/subject-offerings', async (req, res) => {
  try {
    const { semester_id, section_id, subject_id, user_id } = req.body;
    if (!semester_id || !section_id || !subject_id) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO tbl_subject_offerings (semester_id, section_id, subject_id, user_id) VALUES (?, ?, ?, ?)', [semester_id, section_id, subject_id, user_id || null]);
    res.status(201).json({ offering_id: result.insertId, semester_id, section_id, subject_id, user_id: user_id || null });
  } catch (err) {
    console.error('Error creating subject offering:', err);
    res.status(500).json({ error: 'Failed to create subject offering' });
  }
});












const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

// CRON: run every Monday at 03:00 server time
// "0 3 * * 1" = minute 0, hour 3, day-of-week 1 (Monday)
cron.schedule("0 3 * * 1", async () => {
  try {
    console.log("[CRON] Starting weekly attendance generation...");

    // No explicit dates → uses default (today..today+6)
    const result = await generateAttendanceWeek(null, null);

    console.log(
      `[CRON] Done. Inserted ${result.inserted} rows for range ${result.rangeStart} to ${result.rangeEnd}.`
    );
  } catch (err) {
    console.error("[CRON] Error generating weekly attendance:", err);
  }
});
// CRON: auto-mark ABSENT for classes that already ended
// Runs every 1 minute
// CRON: auto-mark ABSENT for any NA flags after class ends
// Runs every 1 minute
// cron.schedule("*/1 * * * *", async () => {
//   try {
//     console.log("[CRON] Auto-absent check started...");

//     // We update records when:
//     // - class end time (date + end_time) is already in the past (with 1-minute grace)
//     // - at least one of the flags (in/check/out) is still NA (1)
//     //
//     // This will:
//     // - For full no-shows (all 1,1,1): mark all 3 as Absent (3)
//     // - For partial attendance (e.g. in=Present, others NA):
//     //      only the NA flags become Absent, the Present/Late/etc stay as-is.
//     const [rows] = await pool.query(
//       `
//       SELECT
//         ar.attendance_id
//       FROM tbl_attendance_records ar
//       JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
//       WHERE (ar.flag_in_id = 1 OR ar.flag_check_id = 1 OR ar.flag_out_id = 1)
//         AND TIMESTAMP(ar.date, cs.end_time) < DATE_SUB(NOW(), INTERVAL 1 MINUTE)
//       `
//       // If you want a longer grace period, change INTERVAL 1 MINUTE -> INTERVAL 15 MINUTE, etc.
//     );

//     if (!rows.length) {
//       console.log("[CRON] Auto-absent: nothing to update.");
//       return;
//     }

//     const ids = rows.map((r) => r.attendance_id);
//     console.log(
//       `[CRON] Auto-absent: updating ${ids.length} record(s). IDs:`,
//       ids
//     );

//     // For any selected record:
//     // - if flag_in_id  == 1 => set to 3 (Absent)
//     // - if flag_check_id == 1 => set to 3 (Absent)
//     // - if flag_out_id == 1 => set to 3 (Absent)
//     //
//     // Flags that are already 2/3/4/5 remain unchanged.
//     await pool.query(
//       `
//       UPDATE tbl_attendance_records
//       SET
//         flag_in_id = CASE
//           WHEN flag_in_id = 1 THEN 3
//           ELSE flag_in_id
//         END,
//         flag_check_id = CASE
//           WHEN flag_check_id = 1 THEN 3
//           ELSE flag_check_id
//         END,
//         flag_out_id = CASE
//           WHEN flag_out_id = 1 THEN 3
//           ELSE flag_out_id
//         END,
//         -- For auto-absent, we only force time_out when it was NA and now becomes Absent.
//         time_out = CASE
//           WHEN flag_out_id = 1 AND time_out IS NULL THEN NOW()
//           ELSE time_out
//         END
//       WHERE attendance_id IN (?)
//       `,
//       [ids]
//     );

//     console.log("[CRON] Auto-absent check finished.");
//   } catch (err) {
//     console.error("[CRON] Error in auto-absent check:", err);
//   }
// });












// CRON: auto-mark ABSENT for any NA flags after class ends
cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("[CRON] Auto-absent check started...");

    // Select records where class has ended AND any flag is still NA
    const [rows] = await pool.query(
      `
      SELECT ar.attendance_id
      FROM tbl_attendance_records ar
      JOIN tbl_class_schedules cs ON ar.schedule_id = cs.schedule_id
      WHERE (ar.flag_in_id = 1 OR ar.flag_check_id = 1 OR ar.flag_out_id = 1)
        AND TIMESTAMP(ar.date, cs.end_time) < DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      `
    );

    if (!rows.length) {
      console.log("[CRON] Auto-absent: nothing to update.");
      return;
    }

    const ids = rows.map(r => r.attendance_id);
    console.log("[CRON] Auto-absent: marking IDs:", ids);

    // Update flags only — NO TIME VALUES ARE SET ANYMORE.
    await pool.query(
      `
      UPDATE tbl_attendance_records
      SET
        flag_in_id = CASE WHEN flag_in_id = 1 THEN 3 ELSE flag_in_id END,
        flag_check_id = CASE WHEN flag_check_id = 1 THEN 3 ELSE flag_check_id END,
        flag_out_id = CASE WHEN flag_out_id = 1 THEN 3 ELSE flag_out_id END
      WHERE attendance_id IN (?)
      `,
      [ids]
    );

    console.log("[CRON] Auto-absent check finished.");
  } catch (err) {
    console.error("[CRON] Error in auto-absent check:", err);
  }
});
