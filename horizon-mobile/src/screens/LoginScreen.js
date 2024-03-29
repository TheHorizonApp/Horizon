import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import theme from "../util/theme";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const scheme = useColorScheme();
  const colors = theme(scheme);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const SecureLogin = () => {
    fetch("http://10.84.27.234:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailOrUsername,
        password: password,
      }),
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to login. Please try again');
      }
    })
    .then((data) => {
      console.log("Login Success:", data);
      if (data.token) {
        const userEmailJson = JSON.stringify({ email: emailOrUsername });
        AsyncStorage.multiSet([
          ['userToken', data.token],
          ['secretKey', data.secretKey],
          ['userEmail', userEmailJson],
        ]);
      } else {
        throw new Error('No token received');
      }
    })
    .then(() => {
   
      navigation.navigate("HomeScreen");
    })
    .catch((error) => {
      console.error("Login Error:", error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: error.message,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        style: { background: colors.secondary }
      });
    });
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome back,
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          It's good to see you again. Sign in to start taking notes!
        </Text>
        <View
          style={[
            styles.individualInputContainer,
            { backgroundColor: "transparent", borderColor: colors.secondary },
          ]}
        >
          <TextInput
            placeholder="Email Address"
            keyboardType="email-address"
            placeholderTextColor="gray"
            style={[styles.textInput, { color: colors.text }]}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
          />
        </View>
        <View
          style={[
            styles.individualInputContainer,
            { backgroundColor: "transparent", borderColor: colors.secondary },
          ]}
        >
          <TextInput
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            style={[styles.textInput, { color: colors.text }]}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          onPress={() => SecureLogin()}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Log In
          </Text>
        </TouchableOpacity>

        {errorMessage ? (
          <Text
            style={{ color: "red", textAlign: "center", marginVertical: 10 }}
          >
            {errorMessage}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() => navigation.navigate("RegisterScreen")}
          style={styles.loginPromptContainer}
        >
          <Text style={[styles.loginPrompt, { color: colors.primary }]}>
            Don't have an account? Sign up here
          </Text>
        </TouchableOpacity>
        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={[styles.orText, { color: colors.subText }]}>OR</Text>
          <View style={styles.line} />
        </View>
        <Toast />
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  individualInputContainer: {
    borderRadius: 10, // Changed to 1
    padding: 20,
    marginBottom: 10, // Adjust space between input fields
    borderWidth: 1,
  },
  textInput: {
    fontSize: 16,
  },
  button: {
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    justifyContent: "center",
  },
  line: {
    flex: 0.1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    marginHorizontal: 8,
  },
  appleButton: {
    height: 50,
    width: "100%",
    alignSelf: "center",
  },
  loginPromptContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  loginPrompt: {
    fontSize: 14,
    fontWeight: "500",
  },
});
