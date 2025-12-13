// app/(tabs)/attendance.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
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
    await startLocationTracking();
    await loadRooms();       // ⬅️ add this
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

  const startLocationTracking = async () => {
    const findNearestRoomName = (
  coords: Location.LocationObjectCoords
): string | null => {
  if (!rooms.length) return null;

  let bestRoom: Room | null = null;
  let bestDist = Infinity;

  for (const room of rooms) {
    if (
      room.latitude == null ||
      room.longitude == null ||
      room.radius == null
    ) {
      continue;
    }

    const d = getDistanceMeters(
      coords.latitude,
      coords.longitude,
      room.latitude,
      room.longitude
    );

    if (d < bestDist) {
      bestDist = d;
      bestRoom = room;
    }
  }

  // Only accept if inside the room's radius
  if (bestRoom && bestDist <= bestRoom.radius) {
    return bestRoom.room_name;
  }

  return null;
};

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
  setCurrentRoom(findNearestRoomName(initial.coords)); // ⬅️
  console.log('Initial coords:', initial.coords);

watchSub.current = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    distanceInterval: 0,
    timeInterval: 1000,
  },
  (loc) => {
    setCoords(loc.coords);
    setCurrentRoom(findNearestRoomName(loc.coords)); // ⬅️
    console.log('Updated coords:', loc.coords);
  }
);
  };

  const loadMyAttendance = async () => {
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
  };

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

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Subject: </Text>
        {item.subject_code} - {item.section_name}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Room: </Text>
        {item.room_name}
      </Text>
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
    GPS: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}{' '}
    (Room: {currentRoom ?? 'x'})
  </Text>
)}

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
