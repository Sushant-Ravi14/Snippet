import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, UPLOADS_BASE_URL } from '../utils/config';
import { getAvatarUrl } from '../utils/helpers';
import { useRouter } from 'expo-router';

const UserRow = ({ user, onToggleFollow }) => {
  const router = useRouter();
  if (!user) return null;

  const userUsername = user?.username || 'deleted_user';
  const userAvatar = user?.avatar;
  const avatarSource = getAvatarUrl(userAvatar, userUsername);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push(`/user/${user.username}`)}
    >
      <Image
        source={{ uri: avatarSource }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.username}>@{userUsername}</Text>
        {user.bio ? <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text> : null}
      </View>
      {onToggleFollow && (
        <TouchableOpacity 
          style={[styles.followBtn, user.amIFollowing ? styles.followingBtn : null]}
          onPress={() => onToggleFollow(user._id)}
        >
          <Text style={[styles.followBtnText, user.amIFollowing ? styles.followingBtnText : null]}>
            {user.amIFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: COLORS.surface,
  },
  info: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
  },
  bio: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  followingBtnText: {
    color: COLORS.text,
  },
});

export default React.memo(UserRow);
