import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Link, router } from "expo-router";
import { ListingsService } from '@/service/listings.service';
import Navbar from '@/components/Navbar';

export default function AddCollection() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [offeredSkills, setOfferedSkills] = useState('');
  const [wantedSkills, setWantedSkills] = useState('');
  const [categories, setCategories] = useState('');
  const [isPhysical, setIsPhysical] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    titre: false,
    description: false,
    offeredSkills: false,
    wantedSkills: false,
  });

  const toggleSwitch = () => setIsPhysical(prev => !prev);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:  ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handlePublier = async () => {
    const userId = await SecureStore.getItemAsync('userId');

  
    const newErrors = {
      titre: titre.trim() === '',
      description: description.trim() === '',
      offeredSkills: offeredSkills.trim() === '',
      wantedSkills: wantedSkills.trim() === '',
    };
    setErrors(newErrors);

  
    if (Object.values(newErrors).some(e => e)) {
      return;
    }

    const data = {
      title: titre,
      description,
      offeredSkills: offeredSkills.split(',').map(s => s.trim()),
      wantedSkills: wantedSkills.split(',').map(s => s.trim()),
      domains: categories.split(',').map(c => c.trim()),
      modality: isPhysical ? 'physical' : 'remote',
      userId: userId || '',
      image: image ? { uri: image, name: image.split('/').pop() || 'image.jpg', type: 'image/jpeg' } : null,
    };

    ListingsService.createListing(data)
     .then(() => {
  
        setTitre('');
        setDescription('');
        setOfferedSkills('');
        setWantedSkills('');
        setCategories('');
        setIsPhysical(false);
        setImage(null);
      
        router.push('/private/Home');
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Erreur', err.response?.data?.msg || 'Échec de la publication');
      });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Publier une annonce</Text>

        <TextInput
          style={[styles.input, errors.titre && styles.inputError]}
          placeholder="Titre de l'annonce"
          value={titre}
          onChangeText={text => { setTitre(text); if (errors.titre) setErrors(prev => ({ ...prev, titre: false })); }}
        />

        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          placeholder="Description détaillée"
          value={description}
          onChangeText={text => { setDescription(text); if (errors.description) setErrors(prev => ({ ...prev, description: false })); }}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={[styles.input, errors.offeredSkills && styles.inputError]}
          placeholder="Compétences offertes (séparées par des virgules)"
          value={offeredSkills}
          onChangeText={text => { setOfferedSkills(text); if (errors.offeredSkills) setErrors(prev => ({ ...prev, offeredSkills: false })); }}
        />

        <TextInput
          style={[styles.input, errors.wantedSkills && styles.inputError]}
          placeholder="Compétences recherchées (séparées par des virgules)"
          value={wantedSkills}
          onChangeText={text => { setWantedSkills(text); if (errors.wantedSkills) setErrors(prev => ({ ...prev, wantedSkills: false })); }}
        />

        <TextInput
          style={styles.input}
          placeholder="Catégories (Langue, Danse, etc.)"
          value={categories}
          onChangeText={setCategories}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>À distance</Text>
          <Switch
            value={isPhysical}
            onValueChange={toggleSwitch}
            trackColor={{ false: '#ccc', true: '#0e58b3' }}
            thumbColor={'#fff'}
          />
          <Text style={styles.switchLabel}>Présentiel</Text>
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Sélectionner une image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.preview} />}

        <TouchableOpacity style={styles.button} onPress={handlePublier}>
          <Text style={styles.buttonText}>Publier mes compétences</Text>
        </TouchableOpacity>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f2f4f8' },
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: 'red',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  switchLabel: { flex: 1, textAlign: 'center', color: '#555' },
  imageButton: {
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 10,
    width: '100%',
    backgroundColor: '#e1e5ea',
    borderRadius: 12,
    alignItems: 'center',
  },
  imageButtonText: { color: '#333', fontSize: 16 },
  preview: { width: '100%', height: 150, borderRadius: 12, marginBottom: 20 },
  button: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#0e58b3',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
