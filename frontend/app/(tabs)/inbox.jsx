import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotifications } from '../../src/api/client';
import { COLORS, UPLOADS_BASE_URL, PAGE_SIZE } from '../../src/utils/config';
import EmptyState from '../../src/components/EmptyState';
import { timeAgo, getAvatarUrl } from '../../src/utils/helpers';

const InboxScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(1, true);
    }, [])
  );

  const fetchNotifications = async (p = 1, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const { data } = await getNotifications(p);
      
      if (isRefresh) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length >= PAGE_SIZE);
      setPage(p);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const handlePress = (item) => {
    if (item.type === 'follow') {
      router.push(`/user/${item.actor.username}`);
    } else if (item.post) {
      router.push(`/post/${item.post._id || item.post}`);
    }
  };

  const renderItem = ({ item }) => {
    const actorUsername = item.actor?.username || 'deleted_user';
    const actorAvatar = item.actor?.avatar;
    const avatarSource = getAvatarUrl(actorAvatar, actorUsername);

    let text = '';
    if (item.type === 'follow') text = 'started following you';
    else if (item.type === 'like') text = 'liked your post';
    else if (item.type === 'comment') text = 'commented on your post';

    return (
      <TouchableOpacity 
        style={[styles.itemContainer, !item.read && styles.unread]}
        onPress={() => handlePress(item)}
      >
        <Image source={{ uri: avatarSource, headers: { 'Bypass-Tunnel-Reminder': 'true' } }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text style={styles.username}>@{actorUsername}</Text> {text}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        {item.post?.image && (
          <Image 
            source={{ uri: item.post.image.startsWith('data:') || item.post.image.startsWith('http') ? item.post.image : `${UPLOADS_BASE_URL}${item.post.image}` }} 
            style={styles.postThumb} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<EmptyState message="No notifications yet" />}
          ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={{ padding: 20 }} color={COLORS.primary} /> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  unread: {
    backgroundColor: '#1E293B',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 15,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: COLORS.text,
  },
  username: {
    fontWeight: 'bold',
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  postThumb: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginLeft: 10,
    backgroundColor: COLORS.surface,
  },
});

export default InboxScreen;
