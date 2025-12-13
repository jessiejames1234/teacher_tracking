// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// --------- DROPDOWN HEADER (Attendance nav) ----------
function AttendanceHeader() {
  const [open, setOpen] = React.useState(false);

  // read current params so we can forward them
  const params = useLocalSearchParams<{ userId?: string; name?: string }>();
  const { userId, name } = params;

  // Only two navigation targets now
  const menuItems = [
    { label: 'Dashboard', path: '/(tabs)' },
    { label: 'Attendance', path: '/(tabs)/attendance' },
  ];

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push({
      pathname: path as any,
      params: {
        userId,
        name,
      },
    });
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top row: logo + search + icons */}
      <View style={styles.headerTopRow}>
        <Image
          source={require('../../assets/images/Phinmalogo2.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <View style={styles.searchBox}>
          <TextInput placeholder="" style={styles.searchInput} />
        </View>

        <IconSymbol name="magnifyingglass" size={18} color="#333" />
        <IconSymbol name="wifi" size={18} color="#008000" />
      </View>

      {/* Second row: dropdown + user initial */}
      <View style={styles.headerBottomRow}>
        <Pressable
          style={styles.dropdown}
          onPress={() => setOpen(prev => !prev)}
        >
          <Text style={styles.dropdownText}>Attendance Management</Text>
          <IconSymbol name="chevron.down" size={14} color="#333" />
        </Pressable>

        <View style={styles.userBox}>
          <Text style={styles.userInitial}>Y</Text>
        </View>
      </View>

      {/* Dropdown menu (floating card) */}
      {open && (
        <View style={styles.dropdownMenu}>
          {menuItems.map(item => (
            <Pressable
              key={item.path}
              style={styles.dropdownItem}
              onPress={() => handleSelect(item.path)}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// --------- EMPTY FOOTER BAR ----------
function Footer() {
  return <View style={styles.footer} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={() => <Footer />}
      screenOptions={{
        header: () => <AttendanceHeader />,
        headerShown: true,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.circle" color={color} />
          ),
        }}
      />


    </Tabs>
  );
}

// ---------- STYLES ----------

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',

    // for floating dropdown
    position: 'relative',
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    height: 18,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 10,
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    flex: 1,
    fontSize: 11,
    color: '#333',
  },
  userBox: {
    marginLeft: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 11,
    color: '#333',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52, // adjust up/down as needed to align under dropdown
    left: 8,
    right: 50, // leave space for the Y box
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 11,
    color: '#333',
  },
  footer: {
    height: 32,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
  },
});
