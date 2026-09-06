import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../src/api/client';
import { compressImage, getFormattedLocation } from '../../src/utils/helpers';
import { COLORS } from '../../src/utils/config';

const CreatePostScreen = () => {
  const router = useRouter();
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
    if (!text && !image) return;
    try {
      setLoading(true);
      const formData = new FormData();
      if (text) formData.append('text', text);
      
      if (image) {
        const filename = image.uri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('image', {
          uri: image.uri,
          name: filename,
          type,
        });
      }

      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
        formData.append('locality', location.locality);
      }

      await createPost(formData);
      
      // Reset form
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity 
          style={[styles.postBtn, (!text && !image) ? styles.postBtnDisabled : null]} 
          onPress={handleSubmit}
          disabled={loading || (!text && !image)}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />

      {image && (
        <View style={styles.imagePreviewContainer}>
          <RNImage source={{ uri: image.uri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
            <Text style={styles.removeImageText}>X</Text>
          </TouchableOpacity>
        </View>
      )}

      {location && (
        <View style={styles.locationChip}>
          <Text style={styles.locationText}>📍 {location.locality}</Text>
          <TouchableOpacity onPress={() => setLocation(null)}>
            <Text style={styles.removeLocationText}> X</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(true)}>
          <Text style={styles.toolText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(false)}>
          <Text style={styles.toolText}>🖼️ Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAttachLocation} disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.toolText}>📍 Location</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 50, // Safe area roughly
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  input: {
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
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
