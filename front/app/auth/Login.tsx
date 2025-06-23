
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Pressable, Alert } from "react-native";
import axios from "axios";
import { Link, router } from "expo-router";

import * as SecureStore from 'expo-secure-store';
import { useUser } from "@/service/context.provider";
import { UserService } from "@/service/user.service";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setConnectedUserAccessToken, setConnectedUserRefreshToken, setConnectedUserId } = useUser();

  const HandlepressLogin = () => {
    
    
    const Data = {
      email,
      password
    }

   
    
    UserService.login(Data)
      .then(Response => {
        console.log(Response.data);
        SecureStore.setItemAsync('userId', Response.data.userId);
        SecureStore.setItemAsync('userAccessToken', Response.data.accessToken);
        SecureStore.setItemAsync('userRefreshToken', Response.data.refreshToken);
        setConnectedUserId(Response.data.userId);
        setConnectedUserAccessToken(Response.data.accessToken);
        setConnectedUserRefreshToken(Response.data.refreshToken);
        Alert.alert("Success", "succes", [
          {
            text: "OK",
            onPress: () => router.push({ pathname: '/private/Home' })
          }
        ]);

      })
      .catch(error => {
        console.log(error.response.data.msg);
        console.log('Error:', error.response ? error.response.data : error.message);
        Alert.alert("Error", error.response ? error.response.data : "Login failed");
        
        
      });
  }






  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to SkillSwap</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}

      />
      <TouchableOpacity style={styles.button}  onPress={HandlepressLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Link href="/auth/Register" style={styles.link}>
        Don&apos;t have an account? Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: '#3498db',
    width: '80%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  link: {
    color: '#3498db',
    marginTop: 20,
    fontSize: 16,
  },
});
