import React from "react";
import { Link } from "expo-router";
import { SafeAreaView, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function Navbar() {
  return (
    <SafeAreaView style={styles.navbar}>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Home">
          <Ionicons name="home-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Search">
          <Ionicons name="search-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Notifications">
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton}>
        <Link href="/private/AddCollection">
          <Ionicons name="add" size={28} color="#fff" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Message">
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Profile">
          <Ionicons name="person-circle-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Link href="/private/Settings">
          <Ionicons name="settings-outline" size={24} color="#333" />
        </Link>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    height: Platform.OS === 'android' ? 80 : 50
  },
  navItem: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1da1f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -55,
    elevation: 5,
    zIndex: 1
  }
});
