import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, UPLOADS_BASE_URL } from '../utils/config';
import { timeAgo } from '../utils/helpers';
import { useRouter } from 'expo-router';
// We'll use simple text for icons if no vector icons, but Expo includes @expo/vector-icons
// We can just use text like '👍' if not sure, but Expo blank template should have vector-icons.
// To be safe and minimal without extra deps, we'll use text emoji if not explicitly told.

const PostCard = ({ post, onLike, onDislike, hideActions = false }) => {
  const router = useRouter();

  if (!post) return null;

  const navigateToProfile = () => {
    router.push(`/user/${post.author.username}`);
  };

  const navigateToPost = () => {
    if (!hideActions) {
      router.push(`/post/${post._id}`);
    }
  };

  const avatarSource = post.author.avatar.startsWith('http')
    ? post.author.avatar
    : `${UPLOADS_BASE_URL}/${post.author.avatar}`;

  const imageSource = post.image
    ? (post.image.startsWith('http') ? post.image : `${UPLOADS_BASE_URL}${post.image}`)
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToProfile} style={styles.authorRow}>
          <Image
            source={{ uri: avatarSource }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View>
            <Text style={styles.username}>@{post.author.username}</Text>
            <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <TouchableOpacity onPress={navigateToPost} activeOpacity={0.9}>
        {post.text ? <Text style={styles.text}>{post.text}</Text> : null}
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.postImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
      </TouchableOpacity>

      {/* Location */}
      {post.location?.locality ? (
        <View style={styles.locationChip}>
          <Text style={styles.locationText}>📍 {post.location.locality}</Text>
        </View>
      ) : null}

      {/* Actions */}
      {!hideActions && (
        <View style={styles.actionsBar}>
          <View style={styles.actionGroup}>
            <TouchableOpacity onPress={() => onLike(post._id)} style={styles.actionBtn}>
              <Text style={post.likedByMe ? styles.actionActive : styles.actionInactive}>
                {post.likedByMe ? '👍' : '👍🏻'} {post.likesCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDislike(post._id)} style={styles.actionBtn}>
              <Text style={post.dislikedByMe ? styles.actionActive : styles.actionInactive}>
                {post.dislikedByMe ? '👎' : '👎🏻'} {post.dislikesCount}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={navigateToPost} style={styles.actionBtn}>
            <Text style={styles.actionInactive}>💬 Comment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.surface,
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  text: {
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.surface,
  },
  locationChip: {
    paddingHorizontal: 15,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginRight: 20,
    paddingVertical: 5,
  },
  actionInactive: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  actionActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default React.memo(PostCard);
