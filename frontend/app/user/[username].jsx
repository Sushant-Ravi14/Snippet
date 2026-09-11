import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getUserProfile, toggleFollow } from '../../src/api/client';
import { COLORS } from '../../src/utils/config';
import EmptyState from '../../src/components/EmptyState';
import { getAvatarUrl } from '../../src/utils/helpers';
import { useAuth } from '../../src/context/AuthContext';

const UserProfileScreen = () => {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // If clicking own profile, navigate to 'You' tab instead
  useEffect(() => {
    if (authUser?.username === username) {
      router.replace('/(tabs)/profile');
    }
  }, [username, authUser]);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data } = await getUserProfile(username);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    // Optimistic update
    setProfile(prev => {
      const amIFollowing = prev.amIFollowing;
      return {
        ...prev,
        amIFollowing: !amIFollowing,
        followersCount: amIFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
      };
    });
    try {
      await toggleFollow(profile._id);
    } catch (e) {
      // Revert on fail
      fetchProfile();
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
    return (
      <View style={styles.container}>
        <EmptyState message="User not found" />
      </View>
    );
  }

  const avatarSource = getAvatarUrl(profile.avatar, profile.username);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: avatarSource, headers: { 'Bypass-Tunnel-Reminder': 'true' } }} style={styles.avatar} />
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

        <TouchableOpacity 
          style={[styles.followBtn, profile.amIFollowing ? styles.followingBtn : null]} 
          onPress={handleToggleFollow}
        >
          <Text style={[styles.followBtnText, profile.amIFollowing ? styles.followingBtnText : null]}>
            {profile.amIFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <EmptyState message={`${profile.username}'s posts`} subMessage="Coming soon!" />
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
    color: COLORS.text,
  },
  statLabel: {
    color: COLORS.textMuted,
  },
  followBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  followingBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  followingBtnText: {
    color: COLORS.text,
  },
});

export default UserProfileScreen;
