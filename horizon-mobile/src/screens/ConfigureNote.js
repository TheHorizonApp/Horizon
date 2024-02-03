import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Animated,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Text,
  FlatList
} from "react-native";
import { AntDesign, Feather, Entypo } from "@expo/vector-icons";
import theme from "../util/theme";
import { Header } from "react-native-elements";

function useDebounce(callback, delay) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedFn;
}

const ConfigureNote = ({ navigation, route }) => {
  const { noteId, title, content, userEmail } = route.params;
  const [noteTitle, setNoteTitle] = useState(title || "");
  const [noteContent, setNoteContent] = useState(content || "");
  const [currentNoteId, setCurrentNoteId] = useState(noteId || null);
  const date = new Date();
  const scheme = useColorScheme();
  const colors = theme(scheme);
  const [isTyping, setIsTyping] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveNote = async () => {
    setIsSaving(true);
    setIsSaved(false);
    if (noteTitle.trim() === "" && noteContent.trim() === "") {
      console.log("Note title and content are empty. Skipping save.");
      return;
    }

    const noteData = {
      email: userEmail,
      title: noteTitle,
      content: noteContent,
      noteId: currentNoteId,
      date: date,
    };

    console.log("Attempting to save note:", noteData);

    try {
      const response = await fetch(
        "http://10.84.27.234:8080/user/saveNote?email=" +
          encodeURIComponent(userEmail),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Save note response:", data);

      if (!noteId && data.noteId) {
        setCurrentNoteId(data.noteId);
      }
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSaveNote = useDebounce(saveNote, 2000);

  const handleTextInputChange = useCallback(
    (text, setText) => {
      setText(text);
      debouncedSaveNote();
      console.log("Current text for debugging: ", text);
    },
    [debouncedSaveNote]
  );

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSaving || isSaved ? 1 : 0,
      useNativeDriver: true,
      speed: 10,
      bounciness: 12,
    }).start();
  }, [isSaving, isSaved]);

  const dismissKeyboardAndCheckmark = () => {
    Keyboard.dismiss();
    setIsTyping(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        leftComponent={
          <TouchableOpacity onPress={onBackPress}>
            <Entypo name="chevron-down" size={32} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <Animated.View
            style={[
              styles.rightComponentContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color={colors.text} />
                <Text style={[styles.savingText, { color: colors.text }]}>
                  Saving...
                </Text>
              </View>
            ) : isSaved ? (
              <View style={styles.savedContainer}>
                <Feather name="check-circle" size={24} color={colors.text} />
                <Text style={[styles.savedText, { color: colors.text }]}>
                  Saved!
                </Text>
              </View>
            ) : null}
          </Animated.View>
        }
        backgroundColor={colors.background}
        containerStyle={{
          borderBottomWidth: 0,
        }}
      />
      <TextInput
        style={[styles.titleInput, { color: colors.text }]}
        onChangeText={(text) => handleTextInputChange(text, setNoteTitle)}
        value={noteTitle}
        placeholder="Untitled"
        placeholderTextColor={colors.subText}
      />
      <ScrollView>
        <TextInput
          style={[styles.contentInput, { color: colors.text }]}
          onChangeText={(text) => handleTextInputChange(text, setNoteContent)}
          value={noteContent}
          placeholder="Content"
          placeholderTextColor={colors.subText}
          multiline
        />
      </ScrollView>
    </View>
  );
};

export default ConfigureNote;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: "bold",
    padding: 15,
    borderRadius: 10,
    marginTop: "10%",
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 15,
    textAlignVertical: "top",
    marginBottom: 15,
    borderRadius: 10,
  },
  colorInput: {
    fontSize: 16,
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
  },
  saveButton: {
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  checkmarkButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1,
  },
  rightComponentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  savingText: {
    marginLeft: 5,
  },
  savedText: {
    marginLeft: 5,
  },
});
