// app/(tabs)/attendance.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Button,
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
  const [loading, setLoading] = useState<boolean>(false);
  const [coords, setCoords] =
    useState<Location.LocationObjectCoords | null>(null);

  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [actionAllowed, setActionAllowed] = useState<boolean>(false);
  const [allowAt, setAllowAt] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  // Acceptable horizontal accuracy (meters) for auto check-in
  const ACCURACY_THRESHOLD_METERS = 30; // adjust as needed (e.g. 20-30m)

  // Find nearest room name given coords using the current `rooms` state
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.error('Error loading rooms:', err);
      }
    };

    const init = async () => {
      setLoading(true);
      try {
        // Load rooms first so the location tracker can immediately map coordinates to rooms
        await loadRooms();
        await startLocationTracking();
        await loadMyAttendance();
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load attendance data.');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (watchSub.current) {
        watchSub.current.remove();
        watchSub.current = null;
      }
    };
  }, [userId]);

  // whenever coords or rooms change recompute the currentRoom
  useEffect(() => {
    if (coords) {
      setCurrentRoom(findNearestRoomName(coords));
    } else {
      setCurrentRoom(null);
    }
  }, [coords, rooms, findNearestRoomName]);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Permission to access location was denied.');
      return;
    }

    try {
      await Location.enableNetworkProviderAsync();
    } catch (e) {
      console.log('enableNetworkProviderAsync error (ok to ignore on some platforms):', e);
    }

    const initial = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setCoords(initial.coords);
    // compute current room using the up-to-date rooms state
    setCurrentRoom(findNearestRoomName(initial.coords));
    console.log('Initial coords:', initial.coords);

    watchSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 0,
        // Update GPS every 500ms as requested
        timeInterval: 500,
      },
      (loc) => {
        setCoords(loc.coords);
        // on each update coords state change triggers effect which recomputes currentRoom
        console.log('Updated coords:', loc.coords);
      }
    );
  };

  const loadMyAttendance = useCallback(async () => {
    const url = `${API_BASE}/api/attendance?teacher_id=${userId}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!Array.isArray(data)) {
      setRecords([]);
      return;
    }
    setRecords(data as AttendanceRecord[]);
  }, [userId]);

  // Polling refs to avoid overlapping requests
  const pollingRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  // Start polling every 2s to refresh attendance list while component is mounted
  useEffect(() => {
    // start after component is ready
    if (!userId) return;

    // immediately load once
    loadMyAttendance().catch((e) => console.error('loadMyAttendance error', e));

    pollingRef.current = setInterval(() => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      loadMyAttendance()
        .catch((e) => console.error('loadMyAttendance error', e))
        .finally(() => {
          isFetchingRef.current = false;
        });
    }, 2000) as unknown as number;

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current as any);
        pollingRef.current = null;
      }
    };
  }, [userId, loadMyAttendance]);

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

  // Prefer a schedule where now ∈ [start,end], else pick nearest start
  const findTodayCurrentRecord = (): AttendanceRecord | null => {
    const todayStr = formatDateYMD(new Date());
    const now = new Date();

    const todays = records.filter((r) => r.date === todayStr);
    if (!todays.length) return null;

    // parse times to Date objects (local)
    const parsed = todays.map((r) => {
      const [y, m, d] = r.date.split('-').map(Number);
      const [sh, sm, ss] = (r.start_time || '00:00:00').split(':').map(Number);
      const [eh, em, es] = (r.end_time || '00:00:00').split(':').map(Number);
      const start = new Date(y, m - 1, d, sh, sm, ss);
      const end = new Date(y, m - 1, d, eh, em, es);
      return { r, start, end };
    });

    // 1) prefer record where now between start and end
    for (const p of parsed) {
      if (now >= p.start && now <= p.end) return p.r;
    }

    // 2) otherwise choose the record with the nearest start time to now (future or past)
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

  // Compute whether the action for a record is allowed now and when it will be allowed
  const computeActionState = (rec: AttendanceRecord | null) => {
    if (!rec) return { allowed: false, allowAt: null, action: null };
    const today = rec.date; // 'YYYY-MM-DD'
    const [y, m, d] = today.split('-').map(Number);
    const [sh, sm, ss] = (rec.start_time || '00:00:00').split(':').map(Number);
    const [eh, em, es] = (rec.end_time || '00:00:00').split(':').map(Number);
    const classStart = new Date(y, m - 1, d, sh, sm, ss);
    const classEnd = new Date(y, m - 1, d, eh, em, es);

    const now = new Date();

    // Determine intended action
    let action: 'check-in' | 'mid-check' | 'check-out' | null = null;
    if (!rec.time_in) action = 'check-in';
    else if (rec.time_in && !rec.time_check) action = 'mid-check';
    else if (rec.time_in && rec.time_check && !rec.time_out) action = 'check-out';
    else action = null;

    if (!action) return { allowed: false, allowAt: null, action: null };

    if (action === 'check-in') {
      const startWindow = new Date(classStart.getTime() - 15 * 60000);
      const endWindow = new Date(classStart.getTime() + 15 * 60000);
      if (now < startWindow) return { allowed: false, allowAt: startWindow.toISOString(), action };
      if (now > endWindow) return { allowed: false, allowAt: null, action };
      return { allowed: true, allowAt: null, action };
    }

    if (action === 'mid-check') {
      const midStart = new Date(classStart.getTime() + 15 * 60000);
      const midEnd = new Date(classStart.getTime() + 45 * 60000);
      if (now < midStart) return { allowed: false, allowAt: midStart.toISOString(), action };
      if (now > midEnd) return { allowed: false, allowAt: null, action };
      return { allowed: true, allowAt: null, action };
    }

    // check-out
    const outStart = new Date(classEnd.getTime() - 15 * 60000);
    if (now < outStart) return { allowed: false, allowAt: outStart.toISOString(), action };
    if (now > classEnd) return { allowed: false, allowAt: null, action };
    return { allowed: true, allowAt: null, action };
  };

  // Recompute actionAllowed/allowAt/currentAction whenever records, coords or time changes
  useEffect(() => {
    const rec = findTodayCurrentRecord();
    const st = computeActionState(rec);
    setActionAllowed(st.allowed);
    setAllowAt(st.allowAt);
    setCurrentAction(st.action);
  }, [records, coords]);

  // Prevent sending early requests from client
  const handleCheckNow = async () => {
    if (!userId) return Alert.alert('Error', 'Missing user id.');

    const rec = findTodayCurrentRecord();
    if (!rec) {
      return Alert.alert('No schedule', 'There are no schedules for today.');
    }

    const state = computeActionState(rec);
    if (!state.allowed) {
      if (state.allowAt) {
        const when = new Date(state.allowAt);
        return Alert.alert('Too early', `This action will be allowed at ${when.toLocaleString()}`);
      }
      return Alert.alert('Not allowed', 'The window for this attendance action has passed or is not applicable.');
    }

    // tell teacher their current schedule/time/room
    Alert.alert(
      'Current Schedule',
      `Your schedule right now is ${formatTime12(rec.start_time)} - ${formatTime12(rec.end_time)} in ${rec.room_name}`
    );

    // find room coordinates
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

    // outside radius
    if (dist > room.radius) {
      return Alert.alert(
        'Not in room',
        `You are outside the allowed room radius (${Math.round(room.radius)}m). Current distance ≈ ${Math.round(dist)}m.`
      );
    }

    // enforce device accuracy threshold before allowing auto check-in
    if (coords.accuracy == null || coords.accuracy > ACCURACY_THRESHOLD_METERS) {
      return Alert.alert(
        'Low GPS accuracy',
        `Your device GPS accuracy is ${coords.accuracy == null ? 'unknown' : Math.round(coords.accuracy)}m. Please move to an area with better GPS signal or wait a moment. Required accuracy ≤ ${ACCURACY_THRESHOLD_METERS}m.`
      );
    }

    // inside radius -> call check-in endpoint
    try {
      const todayStr = formatDateYMD(new Date());

      // decide which attendance action to call based on existing record state
      // - if not checked in yet -> check-in
      // - else if checked in but not mid-check -> mid-check
      // - else if mid-checked but not checked out -> check-out
      let endpoint = `${API_BASE}/api/attendance/check-in`;
      if (rec.time_in && !rec.time_check) {
        endpoint = `${API_BASE}/api/attendance/mid-check`;
      } else if (rec.time_in && rec.time_check && !rec.time_out) {
        endpoint = `${API_BASE}/api/attendance/check-out`;
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

      // Read raw text so we can show full server response when debugging
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
      console.log('Attendance check response:', res.status, text);

      if (!res.ok) {
        const msg = data && (data.error || data.message || data.details) ? (data.error || data.message || data.details) : text || 'Check action failed';
        Alert.alert('Check failed', String(msg));
        return;
      }

      // If server returned the updated attendance row, merge it into local state for instant UX
      try {
        if (data && data.attendance && typeof data.attendance.attendance_id !== 'undefined') {
          const updatedRow = data.attendance as unknown as AttendanceRecord;
          setRecords((prev) => {
            const i = prev.findIndex((r) => r.attendance_id === updatedRow.attendance_id);
            if (i !== -1) {
              const copy = [...prev];
              // merge fields from server row (server returns full joined row)
              copy[i] = { ...copy[i], ...updatedRow } as AttendanceRecord;
              return copy;
            }
            // prepend to keep most-recent-first behavior
            return [updatedRow, ...prev];
          });
        } else {
          // fallback: refresh list if server didn't return row
          await loadMyAttendance();
        }
      } catch (e) {
        console.warn('Failed to merge attendance row, falling back to full reload', e);
        try { await loadMyAttendance(); } catch (err) { console.warn('loadMyAttendance fallback failed', err); }
      }

      // Map endpoint to user-friendly label
      const label = endpoint.endsWith('/check-in')
        ? 'Checked-in'
        : endpoint.endsWith('/mid-check')
        ? 'Attendance checked'
        : 'Checked-out';

      if (data && data.ok) {
        return Alert.alert(label, data.message || `${label} successfully`);
      }

      return Alert.alert('Check', data.message || 'Check action completed');
    } catch (err) {
      console.error('Check action error:', err);
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
        <Button
          title={currentAction ? `Do ${currentAction.replace('-', ' ')}` : 'Check Attendance Now'}
          onPress={handleCheckNow}
          disabled={!actionAllowed}
        />
        {!actionAllowed && allowAt && (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 6 }}>
            Allowed at: {new Date(allowAt).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={records}
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
      )}
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
});
