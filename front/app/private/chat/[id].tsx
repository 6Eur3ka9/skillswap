import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import io, { type Socket } from 'socket.io-client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@/service/context.provider';
import { UserService } from '@/service/user.service';
import {    MessagesService } from '@/service/message.service';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  _id?: string;
  from: string;
  to: string;
  content: string;
  sentAt: string;
}

interface UserProfile {
  name: string;
  profilePicture?: string;
}

const HEADER_HEIGHT = 80;

export default function ChatScreen() {
  const { id: otherUserId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { connectedUserId } = useUser();
const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);

  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    UserService.getUserById(otherUserId)
      .then(({ data }) => setOtherUser({
         name: data.name,
         profilePicture: data.profilePicture
      }))
      .catch(console.error);
  }, [otherUserId]);

 
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await MessagesService.getHistory(otherUserId);

        setMessages(response?.data?.messages || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMessages();
  }, [otherUserId]);


  useEffect(() => {
    socketRef.current = io('http://192.168.1.187:4242', {
      transports: ['websocket']
    });

    socketRef.current.emit('joinRoom', {
      userA: connectedUserId,
      userB: otherUserId
    });

    socketRef.current.on('receiveMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socketRef.current?.disconnect(); };
  }, [connectedUserId, otherUserId]);


  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const msg: Message = {
      from: connectedUserId!,
      to:   otherUserId!,
      content: text,
      sentAt: new Date().toISOString()
    };

    // Affiche immédiatement
    setMessages(prev => [...prev, msg]);
    setInput('');

    try {

      const { data } = await MessagesService.create(msg);

      socketRef.current?.emit('sendMessage', data.message);
     console.log('odndsssc');
     
    } catch (e) {
      console.error('Erreur sauvegarde message', e);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.from === connectedUserId;
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={isMe ? styles.myText : styles.theirText}>{item.content}</Text>
        <Text style={styles.time}>
          {new Date(item.sentAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
     
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {otherUser?.profilePicture && (
          <Image source={{ uri: otherUser.profilePicture }} style={styles.headerAvatar}/>
        )}
        <Text style={styles.headerTitle}>{otherUser?.name || 'Utilisateur'}</Text>
      </View>

     
      <View style={[styles.flex, { marginTop: HEADER_HEIGHT + insets.top }]}>
        <FlatList
          data={messages}
          keyExtractor={item => item._id || item.sentAt}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 16 + 56 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={HEADER_HEIGHT + insets.top}
      >
        <View style={[styles.inputRow, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: '#0e58b3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 10,

  },
  backButton: { padding: 4, marginRight: 12 },
  headerAvatar: {
    width: 36, height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1, borderColor: '#fff'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },

  bubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 10,
    borderRadius: 12
  },
  myBubble: {
    backgroundColor: '#0e58b3',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0
  },
  theirBubble: {
    backgroundColor: '#ddd',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0
  },
  myText:   { color: '#fff', fontSize: 16 },
  theirText:{ color: '#333', fontSize: 16 },
  time:     { fontSize: 10, color: 'white', marginTop: 4, textAlign: 'right' },

  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#eee'
  },
  sendButton: {
    width: 40, height: 40,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#0e58b3',
    alignItems: 'center', justifyContent: 'center'
  }
});