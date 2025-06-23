import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { MessagesService } from '@/service/message.service';
import { useUser } from '@/service/context.provider';

interface Conversation {
  conversationId: string;
  _id: string;
  username: string;
  profilePicture?: string;
  lastMessage: string;
  updatedAt: string;   
  unreadCount: number;
}

export default function Messages() {
  const router = useRouter();
  const { connectedUserId } = useUser();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connectedUserId) return;
    MessagesService.getContact()
      .then(({ data }) => setConvs(data.contacts))
      .catch(err => console.error('Erreur chargement conversations', err))
      .finally(() => setLoading(false));
  }, [connectedUserId]);


  function formatTimeAgo(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'À l’instant';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    return `${d} j`;
  }

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: '/private/chat/[id]', params: { id: item._id } })
      }
    >
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={24} color="#777" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text numberOfLines={1} style={styles.lastMessage}>
          {item.lastMessage}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.time}>{formatTimeAgo(item.updatedAt)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0e58b3" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={convs}
          keyExtractor={item => item.conversationId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Navbar />
    </View>
  );
}

const AVATAR_SIZE = 48;

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e58b3',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  meta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: AVATAR_SIZE,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#e0245e',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 12
  }
});