import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPost, addComment, toggleLike, toggleDislike } from '../../src/api/client';
import PostCard from '../../src/components/PostCard';
import CommentItem from '../../src/components/CommentItem';
import EmptyState from '../../src/components/EmptyState';
import { COLORS } from '../../src/utils/config';

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getPost(id);
      setPost(data);
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    setPost(prev => {
      const isLiked = prev.likedByMe;
      return {
        ...prev,
        likedByMe: !isLiked,
        likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        dislikedByMe: false,
        dislikesCount: prev.dislikedByMe ? prev.dislikesCount - 1 : prev.dislikesCount,
      };
    });
    try {
      await toggleLike(postId);
    } catch (e) {
      fetchPost();
    }
  };

  const handleDislike = async (postId) => {
    setPost(prev => {
      const isDisliked = prev.dislikedByMe;
      return {
        ...prev,
        dislikedByMe: !isDisliked,
        dislikesCount: isDisliked ? prev.dislikesCount - 1 : prev.dislikesCount + 1,
        likedByMe: false,
        likesCount: prev.likedByMe ? prev.likesCount - 1 : prev.likesCount,
      };
    });
    try {
      await toggleDislike(postId);
    } catch (e) {
      fetchPost();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setCommenting(true);
      const { data } = await addComment(id, commentText);
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data]
      }));
      setCommentText('');
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !post) {
    return <EmptyState message={error || 'Post not found'} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={post.comments || []}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View>
            <PostCard 
              post={post} 
              onLike={handleLike}
              onDislike={handleDislike}
              hideActions={false}
            />
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListEmptyComponent={<EmptyState message="No comments yet" />}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={COLORS.textMuted}
          color={COLORS.text}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.postBtn, !commentText.trim() ? styles.postBtnDisabled : null]}
          onPress={handleAddComment}
          disabled={commenting || !commentText.trim()}
        >
          {commenting ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  commentsHeader: {
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  commentsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  postBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
});

export default PostDetailScreen;
