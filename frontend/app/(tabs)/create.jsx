import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image as RNImage, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../src/api/client';
import { compressImage, getFormattedLocation } from '../../src/utils/helpers';
import { COLORS } from '../../src/utils/config';

const CreatePostScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const uri = result.assets[0].uri;
        // Compress immediately after picking
        const compressed = await compressImage(uri);
        setImage(compressed);
      } catch (err) {
        console.error('Compression failed', err);
      }
    }
  };

  const handleAttachLocation = async () => {
    setLocationLoading(true);
    const loc = await getFormattedLocation();
    if (loc) {
      setLocation(loc);
    }
    setLocationLoading(false);
  };

  const handleSubmit = async () => {
    if (!text && !image && !title) return;
    try {
      setLoading(true);
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (text) formData.append('text', text);
      
      if (image) {
        if (Platform.OS === 'web') {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          
          let filename = image.uri.split('/').pop() || 'image.jpg';
          const type = blob.type || 'image/jpeg';
          
          if (!filename.includes('.')) {
            const ext = type.split('/')[1] || 'jpg';
            filename = `${filename}.${ext}`;
          }
          
          formData.append('image', new File([blob], filename, { type }));
        } else {
          let filename = image.uri.split('/').pop() || 'image.jpg';
          // Ensure filename always has a .jpg extension (compressed images may lack one)
          if (!/\.\w+$/.test(filename)) {
            filename = `${filename}.jpg`;
          }
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';
          
          formData.append('image', {
            uri: image.uri,
            name: filename,
            type,
          });
        }
      }

      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
        formData.append('locality', location.locality);
      }

      await createPost(formData);
      
      // Reset form
      setTitle('');
      setText('');
      setImage(null);
      setLocation(null);
      
      router.push('/(tabs)');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const isOverLimit = wordCount > 750;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity 
          style={[styles.postBtn, (!text && !image && !title) || isOverLimit ? styles.postBtnDisabled : null]} 
          onPress={handleSubmit}
          disabled={loading || (!text && !image && !title) || isOverLimit}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Post Title (optional)"
        placeholderTextColor={COLORS.textMuted}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor={COLORS.textMuted}
        value={text}
        onChangeText={setText}
        multiline
      />
      <Text style={[styles.wordCount, isOverLimit && styles.wordCountError]}>
        {wordCount} / 750 words
      </Text>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <RNImage source={{ uri: image.uri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {location && (
        <View style={styles.locationChip}>
          <Ionicons name="location" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.locationText}>{location.locality}</Text>
          <TouchableOpacity onPress={() => setLocation(null)} style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(true)}>
          <Ionicons name="camera-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(false)}>
          <Ionicons name="images-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAttachLocation} disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="location-outline" size={26} color={COLORS.text} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 10, // Safe area handled by SafeAreaView
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  postBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  titleInput: {
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    color: COLORS.text,
  },
  input: {
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: COLORS.text,
  },
  wordCount: {
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  wordCountError: {
    color: COLORS.error,
  },
  imagePreviewContainer: {
    padding: 15,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationChip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationText: {
    color: COLORS.primary,
  },
  removeLocationText: {
    color: COLORS.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 'auto',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  toolText: {
    fontSize: 16,
    color: COLORS.text,
  },
});

export default CreatePostScreen;
