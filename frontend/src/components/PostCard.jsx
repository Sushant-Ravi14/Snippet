import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, UPLOADS_BASE_URL } from '../utils/config';
import { timeAgo, getAvatarUrl } from '../utils/helpers';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PostImage = ({ uri }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!uri) return null;

  if (error) {
    return (
      <View style={[styles.postImage, styles.imageFallback]}>
        <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
        <Text style={{ color: COLORS.textMuted, marginTop: 6, fontSize: 12 }}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <View>
      {loading && (
        <View style={[styles.postImage, styles.imageLoading]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.postImage, loading && { height: 0 }]}
        resizeMode="cover"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </View>
  );
};

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

  const authorUsername = post.author?.username || 'deleted_user';
  const authorAvatar = post.author?.avatar;
  const avatarSource = getAvatarUrl(authorAvatar, authorUsername);

  const imageSource = post.image
    ? (post.image.startsWith('data:') || post.image.startsWith('http') 
        ? post.image 
        : `${UPLOADS_BASE_URL}${post.image}`)
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToProfile} style={styles.authorRow}>
          <Image
            source={{ uri: avatarSource }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.username}>@{authorUsername}</Text>
            <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <TouchableOpacity onPress={navigateToPost} activeOpacity={0.9}>
        {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
        {post.text ? <Text style={styles.text}>{post.text}</Text> : null}
        {imageSource ? <PostImage uri={imageSource} /> : null}
      </TouchableOpacity>

      {/* Location */}
      {post.location?.locality ? (
        <View style={styles.locationChip}>
          <Ionicons name="location" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.locationText}>{post.location.locality}</Text>
        </View>
      ) : null}

      {/* Actions */}
      {!hideActions && (
        <View style={styles.actionsBar}>
          <View style={styles.actionGroup}>
            <TouchableOpacity onPress={() => onLike(post._id)} style={styles.actionBtn}>
              <Ionicons 
                name={post.likedByMe ? "thumbs-up" : "thumbs-up-outline"} 
                size={22} 
                color={post.likedByMe ? COLORS.primary : COLORS.textMuted} 
              />
              <Text style={post.likedByMe ? styles.actionActive : styles.actionInactive}>
                {post.likesCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDislike(post._id)} style={styles.actionBtn}>
              <Ionicons 
                name={post.dislikedByMe ? "thumbs-down" : "thumbs-down-outline"} 
                size={22} 
                color={post.dislikedByMe ? COLORS.primary : COLORS.textMuted} 
              />
              <Text style={post.dislikedByMe ? styles.actionActive : styles.actionInactive}>
                {post.dislikesCount}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={navigateToPost} style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textMuted} />
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
  postTitle: {
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  text: {
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: COLORS.surface,
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
    gap: 6,
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

