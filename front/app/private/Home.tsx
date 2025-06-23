import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ListingsService } from '@/service/listings.service';
import Navbar from '@/components/Navbar';
import { Link, router } from "expo-router";

interface Listing {
  _id: string;
  title: string;
  description: string;
  modality: string;
  profilePicture?: string;
}

export default function Home() {
  const navigation = useNavigation();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await ListingsService.getAllListings();
      setAllListings(response.data.listings);
    } catch (err) {
      console.error('Erreur récupération annonces', err);
    } finally {
      setLoading(false);
    }
  };


  const filtered = allListings.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  );
  const displayed = filtered.slice(0, page * pageSize);

  const loadMore = () => {
    if (page * pageSize >= filtered.length) return;
    setPage(prev => prev + 1);
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => 
   router.push({
     pathname: '/private/ListingDetail/[id]',
     params: { id: item._id }
   })
 }
    >
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badge, item.modality === 'remote' ? styles.remote : styles.physical]}>
            {item.modality === 'remote' ? 'À distance' : 'Présentiel'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
  
      <View style={styles.topNav}>
        {!showSearch ? (
          <Text style={styles.appTitle}>SkillSwap</Text>
        ) : (
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchText}
            onChangeText={text => { setSearchText(text); setPage(1); }}
          />
        )}
        <View style={styles.navIcons}>
          <TouchableOpacity onPress={() => setShowSearch(prev => !prev)} style={styles.iconButton}>
            <Ionicons name={showSearch ? 'close' : 'search'} size={24} color="#0e58b3" />
          </TouchableOpacity>
          
        </View>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={displayed}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="small" style={styles.loaderMore} /> : null}
        />
      )}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  topNav: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation: 4,
    paddingTop: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e58b3',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    color: '#333',
  },
  navIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 16 },
  list: { padding: 16, paddingTop: 0 },
  loader: { flex: 1, justifyContent: 'center' },
  loaderMore: { marginVertical: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 150 },
  imagePlaceholder: { backgroundColor: '#ddd' },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  description: { fontSize: 14, color: '#666' },
  badgeContainer: { marginTop: 8, alignSelf: 'flex-start' },
  badge: { fontSize: 12, fontWeight: '600', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, color: '#fff' },
  remote: { backgroundColor: '#0e58b3' },
  physical: { backgroundColor: '#28a745' },
});
