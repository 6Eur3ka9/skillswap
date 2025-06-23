import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  ActivityIndicator, TouchableOpacity, FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/service/context.provider';
import { UserService } from '@/service/user.service';
import { ListingsService } from '@/service/listings.service';
import * as SecureStore from 'expo-secure-store';
import Navbar from '@/components/Navbar';

interface Listing {
  _id: string;
  title: string;
  profilePicture?: string;
}

interface UserData {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  bio: string;
  averageRating: number;
  reviewCount: number;
}

export default function Profile() {
  const router = useRouter();
  const { connectedUserId, setConnectedUserAccessToken, setConnectedUserRefreshToken, setConnectedUserId } = useUser();
  const [user, setUser] = useState<UserData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) throw new Error('No user');
       
        const { data: userData } = await UserService.getUserById(userId);
        setUser(userData);
        
        const { data: listingsData } = await ListingsService.getListingsByUserId(userData._id);
        setListings(listingsData.listings);
      } catch (e) {
        console.error('Profile load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    const refreshToken = await SecureStore.getItemAsync('userRefreshToken');
    try {
      await UserService.logout({ refreshToken });
      await SecureStore.deleteItemAsync('userAccessToken');
      await SecureStore.deleteItemAsync('userRefreshToken');
      await SecureStore.deleteItemAsync('userId');
      setConnectedUserAccessToken(null);
      setConnectedUserRefreshToken(null);
      setConnectedUserId(null);
      router.replace('/auth/Login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderStar = (index: number) => (
    <Ionicons
      key={index}
      name={index < Math.round(user.averageRating) ? 'star' : 'star-outline'}
      size={20}
      color="#f1c40f"
      style={{ marginRight: 4 }}
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header} />
        <Image
          source={ user.profilePicture ? { uri: user.profilePicture } : require('../assets/defaultprofile.jpg') }
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>

      
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biographie</Text>
          <Text style={styles.bio}>
            {user.bio || "Vous n'avez pas encore ajouté de bio."}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            // onPress={() => router.push('/private/EditBio')}
          >
            <Text style={styles.editButtonText}>
              {user.bio ? 'Modifier la bio' : 'Ajouter une bio'}
            </Text>
          </TouchableOpacity>
        </View>

        
        <View style={[styles.section, styles.ratingSection]}>
          <Text style={styles.sectionTitle}>Note moyenne</Text>
          <View style={styles.starsContainer}>
            {[0,1,2,3,4].map(renderStar)}
            <Text style={styles.reviewCount}>({user.reviewCount})</Text>
          </View>
        </View>

     
        {user._id !== connectedUserId && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push({ pathname: '/private/Message', params: { user: user._id } })}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Envoyer un message</Text>
          </TouchableOpacity>
        )}

   
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos annonces</Text>
          {listings.length === 0 ? (
            <Text style={styles.noListings}>Vous n&apos;avez pas encore publié d&apos;annonces.</Text>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.listingCard}
                  onPress={() => router.push({ pathname: '/private/ListingDetail/[id]', params: { id: item._id } })}
                >
                  {item.profilePicture
                    ? <Image source={{uri: item.profilePicture}} style={styles.listingImage}/>
                    : <View style={styles.listingImagePlaceholder}/>
                  }
                  <Text style={styles.listingTitle}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

     
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      <Navbar />
    </View>
  );
}

const AVATAR_SIZE = 100;
const HEADER_HEIGHT = 120;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  scrollContent: { paddingBottom: 20, alignItems: 'center' },
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  header: { width:'100%', height: HEADER_HEIGHT, backgroundColor: '#1da1f2' },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE/2,
    marginTop: -AVATAR_SIZE/2, borderWidth: 3, borderColor:'#fff'
  },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  username: { fontSize: 16, color: 'gray', marginBottom: 20 },

  section: { width: '90%', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#333' },
  bio: { fontSize: 14, color: '#555', lineHeight: 20 },

  editButton: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: '#0e58b3', paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20
  },
  editButtonText: { color: '#fff', fontWeight: '500' },

  ratingSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starsContainer: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { marginLeft: 8, color: '#666' },

  messageButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#28a745', paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 20, marginBottom: 20
  },
  messageButtonText: { color:'#fff', fontWeight:'500', marginLeft: 8 },

  listingCard: {
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#fff', borderRadius:10, marginBottom:12,
    overflow:'hidden', elevation:2, height: 60
  },
  listingImage: { width:60, height:60 },
  listingImagePlaceholder: { width:60, height:60, backgroundColor:'#ddd' },
  listingTitle: { marginLeft:12, fontSize:16, color:'#333' },

  noListings: { color:'#666', fontStyle:'italic' },

  logoutButton: {
    marginTop:10, backgroundColor:'#e0245e',
    paddingVertical:10, paddingHorizontal:30, borderRadius:20
  },
  logoutText: { color:'#fff', fontWeight:'bold' },
});
