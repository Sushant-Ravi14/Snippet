import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFeed, toggleLike, toggleDislike } from '../../src/api/client';
import PostCard from '../../src/components/PostCard';
import EmptyState from '../../src/components/EmptyState';
import { COLORS, PAGE_SIZE } from '../../src/utils/config';
import { useFocusEffect } from 'expo-router';

const HomeFeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  
  useFocusEffect(
    useCallback(() => {
      // Re-fetch on focus to get fresh data
      fetchPosts(1, true);
    }, [])
  );

  const fetchPosts = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError('');
      
      const { data } = await getFeed(pageNumber);
      
      if (isRefresh) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPage(pageNumber);
    } catch (err) {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, true);
  };

  const onEndReached = () => {
    if (hasMore && !loading && !refreshing) {
      fetchPosts(page + 1);
    }
  };

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const isLiked = p.likedByMe;
        return {
          ...p,
          likedByMe: !isLiked,
          likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
          dislikedByMe: false,
          dislikesCount: p.dislikedByMe ? p.dislikesCount - 1 : p.dislikesCount,
        };
      }
      return p;
    }));
    try {
      await toggleLike(postId);
    } catch (error) {
      // Revert on fail (simplified: just refetch or ignore for this scope)
      fetchPosts(1, true);
    }
  };

  const handleDislike = async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const isDisliked = p.dislikedByMe;
        return {
          ...p,
          dislikedByMe: !isDisliked,
          dislikesCount: isDisliked ? p.dislikesCount - 1 : p.dislikesCount + 1,
          likedByMe: false,
          likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount,
        };
      }
      return p;
    }));
    try {
      await toggleDislike(postId);
    } catch (error) {
      fetchPosts(1, true);
    }
  };

  if (loading && page === 1 && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState message={error} subMessage="Pull down to refresh" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onLike={handleLike} 
            onDislike={handleDislike} 
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState message="No posts yet" subMessage="Follow some users to see their posts!" />}
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={styles.footerLoader} color={COLORS.primary} />
          ) : null
        }
      />
    </SafeAreaView>
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
  footerLoader: {
    paddingVertical: 20,
  },
});

export default HomeFeedScreen;
