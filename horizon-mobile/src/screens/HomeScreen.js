import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import theme from '../util/theme';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import  MasonryList  from '@react-native-seoul/masonry-list';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation, route }) => {
  const userEmail = route.params.userEmail;
  console.log(userEmail)
  const [notes, setNotes] = useState([]);

  const scheme = useColorScheme();
  const colors = theme(scheme);

  const addNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ConfigureNote', { userEmail: userEmail });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [])
  );
  
  const fetchNotes = async () => {
    try {
        const response = await fetch(`http://10.84.27.234:8080/user/getNotes?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        console.log('Fetched notes:', data); 
        if (Array.isArray(data)) {
            setNotes(data);
        } else {
            console.error('Unexpected response structure:', data);
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
};

  const renderItem = ({ item, index }) => {
    console.log(`Rendering note at index: ${index}`);
    console.log(notes)

    const dateObj = new Date(item.createdAt);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    const dynamicHeight = item.title ? Math.max(100, item.title.length * 3.5) : 100;
    console.log(`Note ${index} height: ${dynamicHeight}`);
    console.log(`Content length: ${item.title?.length}, calculated height: ${dynamicHeight}`);

    const onNotePress = () => {
      navigation.navigate('ConfigureNote', { 
        noteId: item.noteId, 
        title: item.title, 
        content: item.content, 
        backgroundColor: item.backgroundColor, 
        date: item.date,
        userEmail: userEmail,
      });
    };

  return (
    <TouchableOpacity onPress={onNotePress}>
      <View style={[styles.note, {
        backgroundColor: item.backgroundColor || '#FFFFFF',
        height: dynamicHeight,
      }]}>
        <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
      <MasonryList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        numColumns={2} 
        showsVerticalScrollIndicator={false}
        style={styles.masonryList}
      />
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.buttonBackground }]}
        onPress={addNote}>
        <Ionicons name="add" size={32} color={colors.buttonText} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginTop: '10%',
  },
  addButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  masonryList: {
    width: '100%',
    
  },
  note: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    top: 10,
  },
  noteTitle: {
    fontWeight: '500',
    fontSize: 18,
  },
  
  dateText: {
    position: 'absolute',
    bottom: 5, // adjust as needed
    right: 5, // adjust as needed
    color: 'gray', // or any other color you prefer
    fontSize: 12, // adjust the font size as needed
  },

});
