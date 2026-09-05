import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/utils/config';
import { debounce } from '../../src/utils/helpers';
import { checkUsername } from '../../src/api/client';

const SignupScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const checkAvailability = useCallback(
    debounce(async (val) => {
      if (!val) {
        setUsernameAvailable(null);
        setCheckingUsername(false);
        return;
      }
      try {
        const { data } = await checkUsername(val);
        setUsernameAvailable(data.available);
      } catch (err) {
        console.error('Failed to check username');
      } finally {
        setCheckingUsername(false);
      }
    }, 400),
    []
  );

  const handleUsernameChange = (val) => {
    setUsername(val);
    setUsernameAvailable(null);
    setCheckingUsername(true);
    checkAvailability(val);
  };

  const handleNext = () => {
    if (!email || !password) {
      setError('Please fill in email and password');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSignup = async () => {
    if (!username) {
      setError('Please choose a username');
      return;
    }
    if (usernameAvailable === false) {
      setError('Username is not available');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signup(email, password, username);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>SocialFeed</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 1 ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { marginTop: 15 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
              />
              {checkingUsername && <ActivityIndicator size="small" color={COLORS.primary} style={styles.indicator} />}
              {!checkingUsername && usernameAvailable === true && <Text style={styles.successText}>Available</Text>}
              {!checkingUsername && usernameAvailable === false && <Text style={styles.errorText}>Taken</Text>}
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSignup}
              disabled={loading || checkingUsername || usernameAvailable === false}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.link}>
              <Text style={styles.linkText}>Back</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  indicator: {
    position: 'absolute',
    right: 15,
  },
  successText: {
    position: 'absolute',
    right: 15,
    color: COLORS.success,
    fontSize: 12,
  },
  errorText: {
    position: 'absolute',
    right: 15,
    color: COLORS.error,
    fontSize: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textMuted,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default SignupScreen;
