import axios from "axios";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Main() {

  return (
    <View style={styles.views}>
      
      <Text style={styles.title}>SkillSwap</Text>
      <Text style={styles.subtitle}>Exchange your skills and learn from others!</Text>
      <Link href="/auth/Login" style={styles.button}>Login</Link>
      <Link href="/auth/Register" style={styles.button}>Register</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  views: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    width: '80%',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
});
