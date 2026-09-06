import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchUsers, searchPosts, toggleFollow, toggleLike, toggleDislike } from '../../src/api/client';
import UserRow from '../../src/components/UserRow';
import PostCard from '../../src/components/PostCard';
import EmptyState from '../../src/components/EmptyState';
import { COLORS, PAGE_SIZE } from '../../src/utils/config';
import { debounce } from '../../src/utils/helpers';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('users'); // 'users' or 'posts'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search
  const performSearch = useCallback(
    debounce(async (q, m, p = 1, isLoadMore = false) => {
      if (!q.trim()) {
        setResults([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      try {
        if (!isLoadMore) setLoading(true);
        let res;
        if (m === 'users') {
          res = await searchUsers(q, p);
        } else {
          res = await searchPosts(q, p);
        }
        
        if (isLoadMore) {
          setResults(prev => [...prev, ...res.data]);
        } else {
          setResults(res.data);
        }

        setHasMore(res.data.length >= PAGE_SIZE);
        setPage(p);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setResults([]);
    performSearch(query, mode, 1, false);
  }, [query, mode]);

  const onEndReached = () => {
    if (hasMore && !loading && results.length > 0) {
      performSearch(query, mode, page + 1, true);
    }
  };

  const handleToggleFollow = async (userId) => {
    setResults(prev => prev.map(u => {
      if (u._id === userId) {
        return { ...u, amIFollowing: !u.amIFollowing };
      }
      return u;
    }));
    try {
      await toggleFollow(userId);
    } catch (e) {
      performSearch(query, mode, 1, false);
    }
  };

  const handleLike = async (postId) => {
    setResults(prev => prev.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          likedByMe: !p.likedByMe,
          likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1,
          dislikedByMe: false,
          dislikesCount: p.dislikedByMe ? p.dislikesCount - 1 : p.dislikesCount,
        };
      }
      return p;
    }));
    await toggleLike(postId);
  };

  const handleDislike = async (postId) => {
    setResults(prev => prev.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          dislikedByMe: !p.dislikedByMe,
          dislikesCount: p.dislikedByMe ? p.dislikesCount - 1 : p.dislikesCount + 1,
          likedByMe: false,
          likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount,
        };
      }
      return p;
    }));
    await toggleDislike(postId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'users' && styles.tabActive]}
            onPress={() => setMode('users')}
          >
            <Text style={[styles.tabText, mode === 'users' && styles.tabTextActive]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, mode === 'posts' && styles.tabActive]}
            onPress={() => setMode('posts')}
          >
            <Text style={[styles.tabText, mode === 'posts' && styles.tabTextActive]}>Posts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            if (mode === 'users') {
              return <UserRow user={item} onToggleFollow={handleToggleFollow} />;
            } else {
              return <PostCard post={item} onLike={handleLike} onDislike={handleDislike} />;
            }
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            query ? <EmptyState message={`No ${mode} found for "${query}"`} /> : <EmptyState message="Search for users or posts" />
          }
          ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={{ padding: 20 }} color={COLORS.primary} /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;
