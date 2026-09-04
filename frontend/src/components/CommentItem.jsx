import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, UPLOADS_BASE_URL } from '../utils/config';
import { timeAgo } from '../utils/helpers';

const CommentItem = ({ comment }) => {
  if (!comment) return null;

  const avatarSource = comment.author.avatar.startsWith('http')
    ? comment.author.avatar
    : `${UPLOADS_BASE_URL}/${comment.author.avatar}`;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarSource }}
        style={styles.avatar}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>@{comment.author.username}</Text>
          <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 14,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
  },
});

export default React.memo(CommentItem);
