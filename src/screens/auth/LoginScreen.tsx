import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Pressable,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  MapPin, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Ref for keyboard navigation
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await login({ email: email.trim().toLowerCase(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.response?.data?.error || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding Header */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <MapPin color={Colors.white} size={36} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>GeoAttend</Text>
          <Text style={styles.subtitle}>Sign in to your workspace</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          
          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle color={Colors.error} size={18} strokeWidth={2.5} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[
            styles.inputContainer, 
            focusedField === 'email' && styles.inputContainerFocused
          ]}>
            <Mail 
              color={focusedField === 'email' ? Colors.primary : Colors.textMuted} 
              size={20} 
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputContainer, 
            focusedField === 'password' && styles.inputContainerFocused
          ]}>
            <Lock 
              color={focusedField === 'password' ? Colors.primary : Colors.textMuted} 
              size={20} 
            />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable 
              onPress={togglePasswordVisibility} 
              style={styles.eyeIcon}
              hitSlop={15} // Makes the icon easier to tap
            >
              {showPassword ? (
                <EyeOff color={Colors.textMuted} size={20} />
              ) : (
                <Eye color={Colors.textMuted} size={20} />
              )}
            </Pressable>
          </View>

          {/* Forgot Password Link (Optional, good practice) */}
          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>

          {/* Submit Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              loading && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed
            ]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Register Link */}
          <Pressable 
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('Register');
            }} 
            style={({ pressed }) => [
              styles.link,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Register</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg 
  },
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: Spacing.xl 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: Spacing.xxxl 
  },
  logoWrapper: {
    backgroundColor: Colors.primary,
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ rotate: '-10deg' }], // Slight dynamic tilt
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: 32, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  subtitle: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.md, 
    fontWeight: '500',
    marginTop: Spacing.xs 
  },
  form: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xxl, 
    padding: Spacing.xxl, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  label: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.sm, 
    fontWeight: '600', 
    marginBottom: Spacing.sm, 
    marginTop: Spacing.lg 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  input: { 
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: Spacing.sm,
    color: Colors.textPrimary, 
    fontSize: Font.size.md, 
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: Font.size.sm,
    fontWeight: '600',
  },
  button: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radius.xl, 
    paddingVertical: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.1,
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  buttonText: { 
    color: Colors.white, 
    fontSize: Font.size.md, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  link: { 
    alignItems: 'center', 
    marginTop: Spacing.xxl 
  },
  linkText: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.md 
  },
  linkBold: { 
    color: Colors.primary, 
    fontWeight: '700' 
  },
  errorBox: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10', // 10% opacity
    borderRadius: Radius.lg, 
    padding: Spacing.md, 
    marginBottom: Spacing.sm,
    gap: 8,
  },
  errorText: { 
    flex: 1,
    color: Colors.error, 
    fontSize: Font.size.sm, 
    fontWeight: '500' 
  },
});