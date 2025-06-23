import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ListingsService } from '@/service/listings.service';
import { useUser } from '@/service/context.provider';

export interface Listing {
  _id: string;
  title: string;
  description: string;
  modality: 'remote' | 'physical';
  profilePicture?: string;
  offeredSkills: { name: string }[];
  wantedSkills: { name: string }[];
  domains: { name: string }[];
  user: { _id: string; username: string; profilePicture?: string };
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { connectedUserId } = useUser();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ListingsService.getListingsById(id)
      .then(({ data }) => setListing(data.listing))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (!listing) return <Text style={styles.error}>Annonce introuvable.</Text>;

  const isOwner = connectedUserId === listing.user._id;

  const handleMessage = () => {
    // router.push(`/private/Messages?userId=${listing.user._id}`);
  };

  const handleAccept = () => {
    Alert.alert(
      'Confirmation',
      "Voulez-vous confirmer cet échange ? Vous devriez d'abord discuter avec l'utilisateur.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: () => {
            // TODO: appeler ExchangeService.acceptExchange(listing._id)
            Alert.alert('Échange confirmé');
            router.back();
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#0e58b3" />
      </TouchableOpacity>

      {listing.profilePicture && <Image source={{ uri: listing.profilePicture }} style={styles.image} />}

      <Text style={styles.title}>{listing.title}</Text>
      <View style={styles.modalityBadge}>
        <Text style={styles.modalityText}>
          {listing.modality === 'remote' ? 'À distance' : 'Présentiel'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{listing.description}</Text>

      <Text style={styles.sectionTitle}>Compétences offertes</Text>
      <View style={styles.tagContainer}>
        {listing.offeredSkills.map(s => <Text key={s.name} style={styles.tag}>{s.name}</Text>)}
      </View>

      <Text style={styles.sectionTitle}>Compétences recherchées</Text>
      <View style={styles.tagContainer}>
        {listing.wantedSkills.map(s => <Text key={s.name} style={styles.tag}>{s.name}</Text>)}
      </View>

      <Text style={styles.sectionTitle}>Domaines</Text>
      <View style={styles.tagContainer}>
        {listing.domains.map(d => <Text key={d.name} style={styles.tag}>{d.name}</Text>)}
      </View>

      <Text style={styles.sectionTitle}>Publié par</Text>
      <TouchableOpacity style={styles.userInfo}
        onPress={() => router.push({ pathname: '/private/UserProfile/[id]', params: { id: listing.user._id } })}
      >
        {listing.user.profilePicture && <Image source={{ uri: listing.user.profilePicture }} style={styles.avatar} />}
        <Text style={styles.userName}>@{listing.user.username}</Text>
      </TouchableOpacity>

      {!isOwner && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleMessage}>
            <Text style={styles.buttonText}>Envoyer un message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.accept]} onPress={handleAccept}>
            <Text style={[styles.buttonText, styles.acceptText]}>Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f4f8' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
  backButton: { marginBottom: 16 },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  modalityBadge: { alignSelf: 'flex-start', backgroundColor: '#0e58b3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 16 },
  modalityText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 },
  description: { fontSize: 14, color: '#666', lineHeight: 20 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userName: { fontSize: 16, color: '#333', fontWeight: '500' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  button: { flex: 1, paddingVertical: 12, backgroundColor: '#0e58b3', borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  accept: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  acceptText: { color: '#fff' }
});
