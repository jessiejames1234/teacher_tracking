// app/index.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Image } from 'react-native';
import { router } from 'expo-router';

// app/index.tsx
import { API_BASE } from "../src/config/api"; // adjust relative path as needed

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

interface LoginResponse {
  token: string;
  user: User;
}

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse | { error?: string } = await res.json();

      if (!res.ok) {
        Alert.alert('Login Failed', (data as any).error || 'Invalid credentials');
        return;
      }

      const { user } = data as LoginResponse;

// Navigate to DASHBOARD first, passing teacher id + name
router.replace({
  pathname: '/(tabs)',
  params: {
    userId: String(user.user_id),
    name: `${user.first_name} ${user.last_name}`,
  },
});

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* TOP: COC LOGO + TEXT */}
        <View style={styles.cocBlock}>
          <Image
            source={require('../assets/images/Phinmalogo2.png')}
            style={styles.cocLogo}
            resizeMode="contain"
          />
          <Text style={styles.cocName}>Cagayan De Oro College</Text>
          <Text style={styles.cocAddress}>
            Max Suniel St. Carmen, Cagayan de Oro City, Misamis Oriental, Philippines 9000
          </Text>
        </View>

        {/* PHINMA LOGO */}
        <View style={styles.phinmaBlock}>
          <Image
            source={require('../assets/images/Phinmalogo1.png')}
            style={styles.phinmaLogo}
            resizeMode="contain"
          />
        </View>

        {/* LOGIN CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Sign In</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.buttonWrapper}>
            <Button
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>

          <Text style={styles.forgot}>Forgot Password?</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  cocBlock: {
    alignItems: 'center',
    marginBottom: 48,
  },
  cocLogo: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  cocName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cocAddress: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    maxWidth: 260,
  },
  phinmaBlock: {
    marginBottom: 36,
  },
  phinmaLogo: {
    width: 230,
    height: 70,
  },
  card: {
    width: 270,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
    color: '#444',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 14,
    color: '#444',
  },
  label: {
    fontSize: 11,
    marginTop: 8,
    marginBottom: 2,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#1976d2',
    paddingVertical: 4,
    marginBottom: 10,
    fontSize: 12,
  },
  buttonWrapper: {
    marginTop: 14,
    marginBottom: 6,
  },
  forgot: {
    fontSize: 10,
    textAlign: 'center',
    color: '#1976d2',
    marginTop: 4,
  },
});
