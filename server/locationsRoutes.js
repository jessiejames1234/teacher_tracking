// locationsRoutes.js
import express from 'express';
import pool from './db.js';

const router = express.Router();

/**
 * BUILDINGS
 */

// GET all buildings
router.get('/buildings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT building_id, building_name, location_description FROM tbl_buildings ORDER BY building_name'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// CREATE building
router.post('/buildings', async (req, res) => {
  try {
    const { building_name, location_description } = req.body;

    if (!building_name || !location_description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO tbl_buildings (building_name, location_description)
       VALUES (?, ?)`,
      [building_name, location_description]
    );

    res.status(201).json({
      building_id: result.insertId,
      building_name,
      location_description,
    });
  } catch (err) {
    console.error('Error creating building:', err);
    res.status(500).json({ error: 'Failed to create building' });
  }
});

/**
 * FLOORS
 */

// GET all floors (with building)
router.get('/floors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         f.floor_id,
         f.floor_number,
         b.building_id,
         b.building_name
       FROM tbl_floors f
       JOIN tbl_buildings b ON f.building_id = b.building_id
       ORDER BY b.building_name, f.floor_number`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching floors:', err);
    res.status(500).json({ error: 'Failed to fetch floors' });
  }
});

// CREATE floor
router.post('/floors', async (req, res) => {
  try {
    const { building_id, floor_number } = req.body;

    if (!building_id || !floor_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO tbl_floors (building_id, floor_number)
       VALUES (?, ?)`,
      [building_id, floor_number]
    );

    res.status(201).json({
      floor_id: result.insertId,
      building_id,
      floor_number,
    });
  } catch (err) {
    console.error('Error creating floor:', err);
    res.status(500).json({ error: 'Failed to create floor' });
  }
});

/**
 * ROOMS
 */

// GET all rooms (with building + floor)
router.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.room_id,
         r.room_name,
         r.latitude,
         r.longitude,
         r.radius,
         b.building_id,
         b.building_name,
         f.floor_id,
         f.floor_number
       FROM tbl_rooms r
       JOIN tbl_buildings b ON r.building_id = b.building_id
       JOIN tbl_floors f    ON r.floor_id = f.floor_id
       ORDER BY b.building_name, f.floor_number, r.room_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// CREATE room
router.post('/rooms', async (req, res) => {
  try {
    const {
      building_id,
      floor_id,
      room_name,
      latitude,
      longitude,
      radius,
    } = req.body;

    if (!building_id || !floor_id || !room_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const latVal = latitude ?? 0;
    const lonVal = longitude ?? 0;
    const radiusVal = radius ?? 10;

    const [result] = await pool.query(
      `INSERT INTO tbl_rooms 
         (building_id, floor_id, latitude, longitude, radius, room_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [building_id, floor_id, latVal, lonVal, radiusVal, room_name]
    );

    res.status(201).json({
      room_id: result.insertId,
      building_id,
      floor_id,
      latitude: latVal,
      longitude: lonVal,
      radius: radiusVal,
      room_name,
    });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export default router;
