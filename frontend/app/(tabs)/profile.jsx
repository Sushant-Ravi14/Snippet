import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getUserProfile } from '../../src/api/client';
import { COLORS, UPLOADS_BASE_URL } from '../../src/utils/config';
import EmptyState from '../../src/components/EmptyState';

const ProfileScreen = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getUserProfile(authUser.username);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return <EmptyState message="Could not load profile" />;
  }

  const avatarSource = profile.avatar.startsWith('http')
    ? profile.avatar
    : `${UPLOADS_BASE_URL}/${profile.avatar}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: avatarSource }} style={styles.avatar} />
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      
      {/* We could render own posts here, but leaving as generic Profile for now */}
      <EmptyState message="Your posts" subMessage="Coming soon!" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
