import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Link, router } from "expo-router";
import { UserService } from '@/service/user.service';
const defaultImage = require("../assets/defaultprofile.jpg")


export default function ProfilePictureUpload() {
  const [image, setImage] = useState<string | null>(null);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    const userId = await SecureStore.getItemAsync("userId");




    let localUri = image || defaultImage;
    let filename = localUri.split ? localUri.split('/').pop() : 'defaultProfilePic.png';

    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    let formData = new FormData();
    formData.append('profilePicture', { uri: localUri, name: filename, type } as any);
    formData.append('userId', userId);



    try {
      UserService.uploadProfilePicture(formData)
        .then(response => {
          console.log('Success:', JSON.stringify(response.data, null, 2));

          router.replace('/private/Home');
        }

        )
        .catch(error => {
          console.log('Error:', JSON.stringify(error.response.data, null, 2));
          Alert.alert('Error', error.response.data.msg || 'Upload failed');
        }
        )
    }
    catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An unexpected error occurred while uploading the image.');
    }
  }
  return (
    <View style={styles.container}>
      <Image source={image ? { uri: image } : defaultImage} style={styles.image} />
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Pick an image from camera roll</Text>
      </TouchableOpacity>
      <Button title="Upload" onPress={handleUpload} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePicker: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
    borderColor: 'black',
    borderWidth: 3,
  },
});
