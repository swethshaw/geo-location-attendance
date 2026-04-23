import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius, Shadow } from '../../theme';

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>First user becomes Admin</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={Colors.textMuted} autoCorrect={false} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min. 6 characters" placeholderTextColor={Colors.textMuted} secureTextEntry />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  emoji: { fontSize: 56, marginBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Font.size.md, marginTop: Spacing.sm },
  form: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadow.md },
  label: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: Spacing.lg, color: Colors.textPrimary, fontSize: Font.size.md, borderWidth: 1, borderColor: Colors.border },
  button: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xxl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: Font.size.md, ...Font.bold },
  link: { alignItems: 'center', marginTop: Spacing.xl },
  linkText: { color: Colors.textSecondary, fontSize: Font.size.sm },
  linkBold: { color: Colors.primary, ...Font.bold },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.error + '30' },
  errorText: { color: Colors.error, fontSize: Font.size.sm, textAlign: 'center' },
});
