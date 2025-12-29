// app/(tabs)/attendance.tsx

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import { API_BASE } from "../../src/config/api"; // adjust relative path as needed
interface Room {
  room_id: number;
  room_name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
}

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // meters
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
};

interface AttendanceRecord {
  attendance_id: number;
  user_id: number;
  schedule_id: number;
  room_id: number;
  date: string;

  time_in: string | null;
  latitude_in: number | null;
  longitude_in: number | null;
  flag_in_id: number;

  time_check: string | null;
  latitude_check: number | null;
  longitude_check: number | null;
  flag_check_id: number;

  time_out: string | null;
  latitude_out: number | null;
  longitude_out: number | null;
  flag_out_id: number;

  first_name: string;
  last_name: string;
  start_time: string;
  end_time: string;
  room_name: string;
  subject_code: string;
  subject_name: string;
  section_name: string;
}

export default function AttendanceScreen() {
  const params = useLocalSearchParams();
  const userId = Number(params.userId);
  const teacherName = typeof params.name === 'string' ? params.name : '';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [coords, setCoords] =
    useState<Location.LocationObjectCoords | null>(null);

  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  // Global UI error message for persistent errors (network, GPS, server responses)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Filter mode: 'today' shows today's schedules (default), 'past' shows past schedules, 'future' shows upcoming
  const [filterMode, setFilterMode] = useState<'today' | 'past' | 'future'>('today');
  const [actionAllowed, setActionAllowed] = useState<boolean>(false);
  const [allowAt, setAllowAt] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [nextSchedule, setNextSchedule] = useState<AttendanceRecord | null>(null);
  const [nextStartDate, setNextStartDate] = useState<Date | null>(null);
  const [nextSecondsLeft, setNextSecondsLeft] = useState<number | null>(null);
  const ACCURACY_THRESHOLD_METERS = 30; // adjust as needed (e.g. 20-30m)

  const findNearestRoomName = useCallback((coords: Location.LocationObjectCoords | null): string | null => {
    if (!coords || !rooms.length) return null;

    let bestRoom: Room | null = null;
    let bestDist = Infinity;

    for (const room of rooms) {
      if (room.latitude == null || room.longitude == null || room.radius == null) continue;

      const d = getDistanceMeters(coords.latitude, coords.longitude, room.latitude, room.longitude);
      if (d < bestDist) {
        bestDist = d;
        bestRoom = room;
      }
    }

    if (bestRoom && bestDist <= bestRoom.radius) return bestRoom.room_name;
    return null;
  }, [rooms]);

  useEffect(() => {
    if (coords) {
      setCurrentRoom(findNearestRoomName(coords));
    } else {
      setCurrentRoom(null);
    }
  }, [coords, rooms, findNearestRoomName]);

  const startLocationTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Location permission denied. Grant location access to use attendance.');
        Alert.alert('Location Required', 'Permission to access location was denied.');
        return;
      }
      setErrorMessage(null);
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      setErrorMessage('Failed to request location permission: ' + msg);
      console.error('startLocationTracking permission error', err);
      return;
    }

    try {
      await Location.enableNetworkProviderAsync();
    } catch (e) {
      if (__DEV__) console.log('enableNetworkProviderAsync error (ok to ignore on some platforms):', e);
      // non-fatal, do not set global error
    }

    try {
      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords(initial.coords);
      setCurrentRoom(findNearestRoomName(initial.coords));
      if (__DEV__) console.log('Initial coords:', initial.coords);
      setErrorMessage(null);
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      setErrorMessage('Unable to get initial GPS position: ' + msg);
      console.error('getCurrentPositionAsync error', err);
    }

    try {
      watchSub.current = await Location.watchPositionAsync(
        {
          // keep a continuous high-accuracy foreground request so the OS location indicator stays visible while app runs
          accuracy: Location.Accuracy.High,
          distanceInterval: 0,
          // update GPS every 1000ms (1 second)
          timeInterval: 1000,
        },
        (loc) => {
          setCoords(loc.coords);
          setCurrentRoom(findNearestRoomName(loc.coords));
          if (__DEV__) console.log('Updated coords:', loc.coords);
          // clear transient GPS error when we receive a fix
          setErrorMessage(null);
        }
      );
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      setErrorMessage('GPS watch failed: ' + msg);
      console.error('watchPositionAsync error', err);
    }
  }, [findNearestRoomName]);

  const loadMyAttendance = useCallback(async () => {
    const url = `${API_BASE}/api/attendance?teacher_id=${userId}`;
    try {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setErrorMessage(`Failed to load attendance: ${res.status} ${text}`);
        console.error('loadMyAttendance non-ok', res.status, text);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setRecords([]);
        setErrorMessage('Unexpected attendance response');
        return;
      }
      setRecords(data as AttendanceRecord[]);
      setErrorMessage(null);
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      setErrorMessage('Network error loading attendance: ' + msg);
      console.error('loadMyAttendance error', err);
    }
  }, [userId]);

  const pollingRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    loadMyAttendance().catch((e) => console.error('loadMyAttendance error', e));

    pollingRef.current = setInterval(() => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      loadMyAttendance()
        .catch((e) => console.error('loadMyAttendance error', e))
        .finally(() => {
          isFetchingRef.current = false;
        });
    }, 5000) as unknown as number;

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current as any);
        pollingRef.current = null;
      }
    };
  }, [userId, loadMyAttendance]);

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'Missing user ID.');
      return;
    }

    const loadRooms = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data as Room[]);
          setErrorMessage(null);
        } else {
          setRooms([]);
          setErrorMessage('Unexpected rooms response from server');
        }
      } catch (err) {
        console.error('Error loading rooms:', err);
        setErrorMessage('Failed to load rooms: ' + String(err && (err as any).message ? (err as any).message : err));
      }
    };

    const init = async () => {
      try {
        await loadRooms();
        await startLocationTracking();
        await loadMyAttendance();
      } catch (err) {
        console.error(err);
        setErrorMessage('Initialization failed: ' + String(err && (err as any).message ? (err as any).message : err));
        Alert.alert('Error', 'Failed to load attendance data.');
      }
    };

    init();

    // Intentionally do not remove the GPS watcher here so the foreground location request remains active
    // while the app is running; this keeps the OS location indicator visible.
    return () => {};
  }, [userId, startLocationTracking, loadMyAttendance]);

  const formatTime12 = (value: string | null): string => {
    if (!value) return '—';

    let dateObj: Date;

    if (value.includes('T') || value.includes(' ')) {
      dateObj = new Date(value);
    } else {
      dateObj = new Date(`1970-01-01T${value}`);
    }

    if (isNaN(dateObj.getTime())) return '—';

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minStr = String(minutes).padStart(2, '0');
    return `${hours}:${minStr}${ampm}`;
  };
  const getFlagLabel = (flagId: number | null | undefined): string => {
    switch (flagId) {
      case 1:
        return 'NA';
      case 2:
        return 'Present';
      case 3:
        return 'Absent';
      case 4:
        return 'Excused';
      case 5:
        return 'Late';
      default:
        return '—';
    }
  };

  const formatDateYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const findTodayCurrentRecord = (): AttendanceRecord | null => {
    const todayStr = formatDateYMD(new Date());
    const now = new Date();

    const todays = records.filter((r) => r.date === todayStr);
    if (!todays.length) return null;

    const parsed = todays.map((r) => {
      const [y, m, d] = r.date.split('-').map(Number);
      const [sh, sm, ss] = (r.start_time || '00:00:00').split(':').map(Number);
      const [eh, em, es] = (r.end_time || '00:00:00').split(':').map(Number);
      const start = new Date(y, m - 1, d, sh, sm, ss);
      const end = new Date(y, m - 1, d, eh, em, es);
      return { r, start, end };
    });

    for (const p of parsed) {
      if (now >= p.start && now <= p.end) return p.r;
    }

    let best: { r: AttendanceRecord; start: Date } | null = null;
    for (const p of parsed) {
      if (!best) best = { r: p.r, start: p.start };
      else {
        const bestDiff = Math.abs(best.start.getTime() - now.getTime());
        const curDiff = Math.abs(p.start.getTime() - now.getTime());
        if (curDiff < bestDiff) best = { r: p.r, start: p.start };
      }
    }

    return best ? best.r : null;
  };

  // Return the schedule where now is between start and end (strictly active). Do not fall back to nearest.
  const findActiveSchedule = (): AttendanceRecord | null => {
    const todayStr = formatDateYMD(new Date());
    const now = new Date();
    const todays = records.filter((r) => r.date === todayStr);
    if (!todays.length) return null;
    for (const r of todays) {
      const [y, m, d] = r.date.split('-').map(Number);
      const [sh, sm, ss] = (r.start_time || '00:00:00').split(':').map(Number);
      const [eh, em, es] = (r.end_time || '00:00:00').split(':').map(Number);
      const start = new Date(y, m - 1, d, sh, sm, ss);
      const end = new Date(y, m - 1, d, eh, em, es);
      if (now >= start && now <= end) return r;
    }
    return null;
  };

  // Use active schedule for gating (button enabled only when a schedule is currently in-progress)
  useEffect(() => {
    const active = findActiveSchedule();
    const st = computeActionState(active as AttendanceRecord | null);
    setActionAllowed(!!active && st.allowed);
    setAllowAt(st.allowAt);
    if (active) {
      // Show action for the active schedule
      if (st.action) {
        const label = st.action === 'check-in' ? 'Check-in' : st.action === 'mid-check' ? 'Mid-check' : 'Check-out';
        setCurrentAction(st.predictedFlag === 'late' ? `${label} (late)` : label);
      } else {
        setCurrentAction(null);
      }
    } else {
      // No active schedule: disable action and show placeholder
      setCurrentAction(null);
      setAllowAt(null);
    }
  }, [records, coords, findActiveSchedule]);

  const computeActionState = (rec: AttendanceRecord | null) => {
    if (!rec) return { allowed: false, allowAt: null, action: null, predictedFlag: null };
    const today = rec.date;
    const [y, m, d] = today.split('-').map(Number);
    const [sh, sm, ss] = (rec.start_time || '00:00:00').split(':').map(Number);
    const [eh, em, es] = (rec.end_time || '00:00:00').split(':').map(Number);
    const classStart = new Date(y, m - 1, d, sh, sm, ss);
    const classEnd = new Date(y, m - 1, d, eh, em, es);

    const now = new Date();

    let action: 'check-in' | 'mid-check' | 'check-out' | null = null;
    if (!rec.time_in) action = 'check-in';
    else if (rec.time_in && !rec.time_check) action = 'mid-check';
    else if (rec.time_in && rec.time_check && !rec.time_out) action = 'check-out';
    else action = null;

    if (!action) return { allowed: false, allowAt: null, action: null, predictedFlag: null };

    const classDuration = classEnd.getTime() - classStart.getTime();
    const center = new Date(classStart.getTime() + classDuration / 2);
    const midStart = new Date(center.getTime() - 10 * 60000);
    const midEnd = new Date(center.getTime() + 10 * 60000);

    if (action === 'check-in') {
      const presentEnd = new Date(classStart.getTime() + 15 * 60000);
      if (now < classStart) return { allowed: false, allowAt: classStart.toISOString(), action, predictedFlag: null };
      if (now > classEnd) return { allowed: false, allowAt: null, action, predictedFlag: null };
      const predictedFlag = now <= presentEnd ? 'present' : 'late';
      return { allowed: true, allowAt: null, action, predictedFlag };
    }

    if (action === 'mid-check') {
      if (now < midStart) return { allowed: false, allowAt: midStart.toISOString(), action, predictedFlag: null };
      if (now > classEnd) return { allowed: false, allowAt: null, action, predictedFlag: null };
      const predictedFlag = now >= midStart && now <= midEnd ? 'present' : 'late';
      return { allowed: true, allowAt: null, action, predictedFlag };
    }

    const outStart = new Date(classEnd.getTime() - 15 * 60000);
    if (now < outStart) return { allowed: false, allowAt: outStart.toISOString(), action, predictedFlag: null };
    if (now > classEnd) return { allowed: false, allowAt: null, action, predictedFlag: null };
    return { allowed: true, allowAt: null, action, predictedFlag: 'present' };
  };

  const computeNextSchedule = useCallback(() => {
    if (!records || !records.length) {
      setNextSchedule(null);
      setNextStartDate(null);
      setNextSecondsLeft(null);
      return;
    }

    const now = new Date();
    let best: { rec: AttendanceRecord; start: Date } | null = null;

    for (const r of records) {
      const [y, m, d] = r.date.split('-').map(Number);
      const [sh, sm, ss] = (r.start_time || '00:00:00').split(':').map(Number);
      const start = new Date(y, m - 1, d, sh, sm, ss);
      if (start.getTime() >= now.getTime()) {
        const diff = start.getTime() - now.getTime();
        if (!best || diff < (best.start.getTime() - now.getTime())) {
          best = { rec: r, start };
        }
      }
    }

    if (!best) {
      setNextSchedule(null);
      setNextStartDate(null);
      setNextSecondsLeft(null);
      return;
    }

    setNextSchedule(best.rec);
    setNextStartDate(best.start);
    setNextSecondsLeft(Math.max(0, Math.ceil((best.start.getTime() - Date.now()) / 1000)));
  }, [records]);

  useEffect(() => {
    computeNextSchedule();
  }, [records, computeNextSchedule]);

  useEffect(() => {
    if (!nextStartDate) {
      setNextSecondsLeft(null);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.ceil((nextStartDate.getTime() - Date.now()) / 1000));
      setNextSecondsLeft(diff);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextStartDate]);

  // derive filteredRecords according to filterMode
  const filteredRecords = useMemo(() => {
    const todayStr = formatDateYMD(new Date());
    if (!records || !records.length) return [] as AttendanceRecord[];

    if (filterMode === 'today') {
      const todays = records.filter((r) => r.date === todayStr);
      // put current schedule first if present
      const current = findTodayCurrentRecord();
      if (current) {
        const others = todays.filter((r) => r.attendance_id !== current.attendance_id);
        return [current, ...others];
      }
      // otherwise return todays sorted by start_time
      return todays.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }

    if (filterMode === 'past') {
      // dates less than today
      const past = records.filter((r) => r.date < todayStr);
      // show most recent past first
      return past.sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || '').localeCompare(a.start_time || ''));
    }

    // future
    const future = records.filter((r) => r.date > todayStr);
    // show nearest upcoming first
    return future.sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''));
  }, [records, filterMode, findTodayCurrentRecord]);

  const nextCountdownStr = () => {
    if (nextSecondsLeft == null) return null;
    if (nextSecondsLeft <= 0) return 'now';
    const days = Math.floor(nextSecondsLeft / 86400);
    const hours = Math.floor((nextSecondsLeft % 86400) / 3600);
    const mins = Math.floor((nextSecondsLeft % 3600) / 60);
    const secs = nextSecondsLeft % 60;
    if (days > 0) return `${days}d ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  // compute current schedule and distance to its room (used for UI warnings)
  const currentRec = findTodayCurrentRecord();
  const currentRoomObj = currentRec ? rooms.find((r) => r.room_id === currentRec.room_id) ?? null : null;
  const currentDist = (coords && currentRoomObj)
    ? getDistanceMeters(coords.latitude, coords.longitude, Number(currentRoomObj.latitude), Number(currentRoomObj.longitude))
    : null;
  const isOutOfRange = currentDist != null && currentRoomObj ? currentDist > Number(currentRoomObj.radius) : false;

  const handleCheckNow = async () => {
    if (!userId) return Alert.alert('Error', 'Missing user id.');

    // clear previous errors when user initiates a check
    setErrorMessage(null);

    // Only allow check when there is an active schedule
    const rec = findActiveSchedule();
    if (!rec) return Alert.alert('No current schedule', 'There is no active schedule right now. The check button is disabled.');

    const state = computeActionState(rec);
    if (!state.allowed) {
      if (state.allowAt) {
        const when = new Date(state.allowAt);
        return Alert.alert('Too early', `This action will be allowed at ${when.toLocaleString()}`);
      }
      return Alert.alert('Not allowed', 'The window for this attendance action has passed or is not applicable.');
    }

    Alert.alert(
      'Current Schedule',
      `Your schedule right now is ${formatTime12(rec.start_time)} - ${formatTime12(rec.end_time)} in ${rec.room_name}`
    );

    const room = rooms.find((r) => r.room_id === rec.room_id);
    if (!room) {
      return Alert.alert('Error', 'Room information not available.');
    }

    if (!coords) {
      return Alert.alert('Location needed', 'Unable to get device GPS. Please enable location and try again.');
    }

    const dist = getDistanceMeters(
      coords.latitude,
      coords.longitude,
      Number(room.latitude),
      Number(room.longitude)
    );

    if (dist > room.radius) {
      return Alert.alert(
        'Not in room',
        `You are outside the allowed room radius (${Math.round(room.radius)}m). Current distance ≈ ${Math.round(dist)}m.`
      );
    }

    if (coords.accuracy == null || coords.accuracy > ACCURACY_THRESHOLD_METERS) {
      return Alert.alert(
        'Low GPS accuracy',
        `Your device GPS accuracy is ${coords.accuracy == null ? 'unknown' : Math.round(coords.accuracy)}m. Please move to an area with better GPS signal or wait a moment. Required accuracy ≤ ${ACCURACY_THRESHOLD_METERS}m.`
      );
    }

    try {
      const todayStr = formatDateYMD(new Date());

      let endpoint = `${API_BASE}/api/attendance/check-in`;
      if (rec.time_in && !rec.time_check) {
        endpoint = `${API_BASE}/api/attendance/mid-check`;
      } else if (rec.time_in && rec.time_check && !rec.time_out) {
        endpoint = `${API_BASE}/api/attendance/check-out`;
      }

      const [y, m, d] = rec.date.split('-').map(Number);
      const [sh, sm, ss] = (rec.start_time || '00:00:00').split(':').map(Number);
      const [eh, em, es] = (rec.end_time || '00:00:00').split(':').map(Number);
      const classStartLocal = new Date(y, m - 1, d, sh, sm, ss);
      const classEndLocal = new Date(y, m - 1, d, eh, em, es);
      const now = new Date();
    
      const payload = {
        schedule_id: rec.schedule_id,
        user_id: userId,
        date: todayStr,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      };
    
      if (__DEV__) {
        console.log('About to POST attendance:', { endpoint, payload });
        console.log('Local times:', { now: now.toISOString(), classStartLocal: classStartLocal.toISOString(), classEndLocal: classEndLocal.toISOString() });
        console.log('Computed client action state:', state, 'Distance(m):', Math.round(dist), 'Room radius:', room.radius, 'Accuracy:', coords.accuracy);
        Alert.alert('Debug', `Now: ${now.toLocaleString()}\nClass: ${classStartLocal.toLocaleTimeString()} - ${classEndLocal.toLocaleTimeString()}\nDistance: ${Math.round(dist)}m (radius ${Math.round(room.radius)}m)\nAccuracy: ${coords.accuracy}m`);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: rec.schedule_id,
          user_id: userId,
          date: todayStr,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      });

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
      if (__DEV__) console.log('Attendance check response:', res.status, text);

      if (!res.ok) {
        const msg = data && (data.error || data.message || data.details) ? (data.error || data.message || data.details) : text || 'Check action failed';
        setErrorMessage(String(msg));
        Alert.alert('Check failed', String(msg));
        return;
      }

      try {
        if (data && data.attendance && typeof data.attendance.attendance_id !== 'undefined') {
          const updatedRow = data.attendance as unknown as AttendanceRecord;
          setRecords((prev) => {
            const i = prev.findIndex((r) => r.attendance_id === updatedRow.attendance_id);
            if (i !== -1) {
              const copy = [...prev];
              copy[i] = { ...copy[i], ...updatedRow } as AttendanceRecord;
              return copy;
            }
            return [updatedRow, ...prev];
          });
        } else {
          await loadMyAttendance();
        }
      } catch (e) {
        console.warn('Failed to merge attendance row, falling back to full reload', e);
        try { await loadMyAttendance(); } catch (err) { console.warn('loadMyAttendance fallback failed', err); }
      }

      const label = endpoint.endsWith('/check-in')
        ? 'Checked-in'
        : endpoint.endsWith('/mid-check')
        ? 'Attendance checked'
        : 'Checked-out';

      if (data && data.ok) {
        setErrorMessage(null);
        return Alert.alert(label, data.message || `${label} successfully`);
      }

      setErrorMessage(null);
      return Alert.alert('Check', data.message || 'Check action completed');
    } catch (err) {
      console.error('Check action error:', err);
      const msg = String(err && (err as any).message ? (err as any).message : err);
      setErrorMessage('Check action failed: ' + msg);
      return Alert.alert('Error', 'Failed to perform check action.');
    }
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Class Time: </Text>
        {formatTime12(item.start_time)} - {formatTime12(item.end_time)}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Time In: </Text>
        {getFlagLabel(item.flag_in_id)}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Time Check: </Text>
        {getFlagLabel(item.flag_check_id)}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Time Out: </Text>
        {getFlagLabel(item.flag_out_id)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        My Attendance {teacherName ? `– ${teacherName}` : ''}
      </Text>

      {coords && (
        <Text style={styles.gpsInfo}>
          GPS: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}{' '}
          (Acc: {coords.accuracy != null ? coords.accuracy.toFixed(1) : 'N/A'}m — Req ≤ {ACCURACY_THRESHOLD_METERS}m){' '}
          {coords.altitude != null ? ` Alt: ${coords.altitude.toFixed(1)}m` : ''}
          {coords.altitudeAccuracy != null ? ` (±${coords.altitudeAccuracy.toFixed(1)}m)` : ''}
          {' '}(Room: {currentRoom ?? 'x'})
        </Text>
      )}

      <View style={{ marginVertical: 8 }}>
        <TouchableOpacity
          onPress={handleCheckNow}
          activeOpacity={0.8}
          disabled={!actionAllowed || isOutOfRange}
          style={[
            styles.actionButton,
            actionAllowed && !isOutOfRange ? styles.actionButtonActive : styles.actionButtonDisabled,
          ]}
        >
          <Text style={[styles.actionButtonText, actionAllowed && !isOutOfRange ? styles.actionButtonTextActive : {}]}>
            {currentAction ? `Do ${currentAction.replace('-', ' ')}` : 'No current schedule'}
          </Text>
        </TouchableOpacity>

        {/* show canonical allow time when not allowed */}
        {!actionAllowed && allowAt && (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 6 }}>
            Allowed at: {new Date(allowAt).toLocaleTimeString()} (current schedule)
          </Text>
        )}

        {/* Show persistent error or GPS status below the action button */}
        {!coords && (
          <Text style={{ textAlign: 'center', color: '#b00020', marginTop: 6 }}>
            Waiting for GPS fix...
          </Text>
        )}

        {errorMessage && (
          <Text style={{ textAlign: 'center', color: '#b00020', marginTop: 6 }}>
            {errorMessage}
          </Text>
        )}

        {/* show warning when device not in room coordinates */}
        {coords && currentRec && currentRoomObj && isOutOfRange && (
          <Text style={{ textAlign: 'center', color: '#b00020', marginTop: 6 }}>
            You are outside the allowed room area ({Math.round(currentDist ?? 0)}m vs allowed {Math.round(Number(currentRoomObj.radius))}m). The check button is disabled until you move closer.
          </Text>
        )}

        {nextSchedule && nextStartDate ? (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: '#333' }}>
              Next: {formatTime12(nextSchedule.start_time)} on {nextSchedule.date}
            </Text>
            {(() => {
              const now = new Date();
              const nextDay = nextStartDate.getDate() !== now.getDate() || nextStartDate.getMonth() !== now.getMonth() || nextStartDate.getFullYear() !== now.getFullYear();
              return (
                <Text style={{ color: '#666', marginTop: 4 }}>
                  {nextDay ? `(your next schedule is on ${new Date(nextSchedule.date).toLocaleDateString(undefined, { weekday: 'long' })})` : `Starts in ${nextCountdownStr()}`}
                </Text>
              );
            })()}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>No upcoming schedules.</Text>
        )}
      </View>

      {/* Compact pill filter controls */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterMode === 'today' && styles.filterButtonActive]}
          onPress={() => setFilterMode('today')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filterMode === 'today' && styles.filterTextActive]}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterMode === 'past' && styles.filterButtonActive]}
          onPress={() => setFilterMode('past')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filterMode === 'past' && styles.filterTextActive]}>Past</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterMode === 'future' && styles.filterButtonActive]}
          onPress={() => setFilterMode('future')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filterMode === 'future' && styles.filterTextActive]}>Future</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => String(item.attendance_id)}
        renderItem={renderItem}
        contentContainerStyle={
          records.length === 0 && { flex: 1, justifyContent: 'center' }
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#666' }}>
            No attendance records found.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  gpsInfo: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  date: {
    fontWeight: '600',
    marginBottom: 4,
  },
  line: {
    marginBottom: 2,
  },
  label: {
    fontWeight: '500',
  },
  filterText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  actionButtonActive: {
    backgroundColor: '#007bff',
  },
  actionButtonDisabled: {
    backgroundColor: '#ddd',
  },
  actionButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
});
