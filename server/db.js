import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_teacher_attendance_3d_school',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
