import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<Nav>();

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🔥 BURNOUT</Text>
        <Text style={styles.subtitle}>Car culture, unleashed.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>LOG IN</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Sign Up</Text></Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => { setEmail('demo@burnout.app'); setPassword('demo1234'); }}
        >
          <Text style={styles.demoBtnText}>🔧 Fill Demo Credentials</Text>
        </TouchableOpacity>
        <Text style={styles.demoNote}>
          Use demo@burnout.app / demo1234 after running scripts/seed.js
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  logo: { fontSize: 42, fontWeight: '900', color: '#FF4500', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 48 },
  input: {
    backgroundColor: '#1A1A1A', color: '#fff', borderRadius: 10, padding: 16,
    fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2A',
  },
  btn: {
    backgroundColor: '#FF4500', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 20,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  link: { color: '#888', textAlign: 'center', fontSize: 14 },
  linkAccent: { color: '#FF4500', fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#555', marginHorizontal: 12, fontSize: 13 },
  demoBtn: {
    borderWidth: 1, borderColor: '#FF4500', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  demoBtnText: { color: '#FF4500', fontWeight: '700', fontSize: 15 },
  demoNote: { color: '#555', textAlign: 'center', fontSize: 11, lineHeight: 16 },
});
