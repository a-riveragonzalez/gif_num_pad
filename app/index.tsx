import React, { useState, useEffect, useRef, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ImageSourcePropType,
  TextInput,
  AppState,
  AppStateStatus,
} from "react-native";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

interface GifMapType {
  [key: string]: ImageSourcePropType;
}

type NumberKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

// GIF mapping - replace these with your actual GIF files
const GIF_MAP: GifMapType = {
  "1": require("../assets/gifs/alastor_take_over.gif"),
  "2": require("../assets/gifs/vox_eye_roll.gif"),
  "3": require("../assets/gifs/vox_face_1.gif"),
  "4": require("../assets/gifs/vox_idle_look.gif"),
  "5": require("../assets/gifs/vox_red_eye.gif"),
  "6": require("../assets/gifs/error_screen_1.gif"),
  "7": require("../assets/gifs/error_screen_2.gif"),
  "8": require("../assets/gifs/error_screen_3.gif"),
  "9": require("../assets/gifs/gif2.gif"), // meme cat 
  "0": require("../assets/gifs/gif0.gif"), // extra
};

// Placeholder GIF for testing
const PLACEHOLDER_GIF: string =
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";

export default function GifNumberPadApp(): JSX.Element {
  const [currentGif, setCurrentGif] = useState<
    ImageSourcePropType | string | null
  >(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastPressed, setLastPressed] = useState<NumberKey | null>(null);
  const [hiddenInput, setHiddenInput] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Refs for managing input focus
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    startListening();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        startListening();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
      stopListening();
    };
  }, []);

  const startListening = (): void => {
    setIsListening(true);
    setDebugInfo("Listening for Bluetooth number pad input...");

    // Focus the hidden input to capture key events
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 100);
  };

  const stopListening = (): void => {
    setIsListening(false);
    setDebugInfo("Stopped listening");
    hiddenInputRef.current?.blur();
  };

  const handleHiddenInputChange = (text: string): void => {
    console.log("Hidden input changed:", text);
    setHiddenInput(text);

    // Extract the last character (most recent input)
    if (text.length > 0) {
      const lastChar = text[text.length - 1];
      setDebugInfo(`Last input: "${lastChar}" (${lastChar.charCodeAt(0)})`);

      // Check if it's a number
      if (/^[0-9]$/.test(lastChar)) {
        handleNumberPress(lastChar as NumberKey);
      }
    }

    // Clear the input after processing
    setTimeout(() => {
      setHiddenInput("");
      hiddenInputRef.current?.focus();
    }, 50);
  };

  const handleKeyPress = (event: any): void => {
    console.log("Key press event:", event.nativeEvent);
    const key = event.nativeEvent.key;

      // Prevent Enter key from doing anything
  if (key === 'Enter') {
    event.preventDefault();
    return;
  }

    setDebugInfo(`Key pressed: "${key}"`);

    if (/^[0-9]$/.test(key)) {
      handleNumberPress(key as NumberKey);
    }
  };

  const handleNumberPress = (number: NumberKey): void => {
    console.log(`Number pressed: ${number}`);

    // Update the selected number (this persists until new number is pressed)
    setLastPressed(number);
    setDebugInfo(`✅ Number ${number} detected!`);

    // Get the corresponding GIF
    const gif = GIF_MAP[number];
    if (gif) {
      setCurrentGif(gif);
    } else {
      // Use placeholder for testing
      setCurrentGif(PLACEHOLDER_GIF);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />

      {/* Hidden input field to capture Bluetooth keyboard input */}
      <TextInput
        ref={hiddenInputRef}
        style={styles.hiddenInput}
        value={hiddenInput}
        onChangeText={handleHiddenInputChange}
        onKeyPress={handleKeyPress}
        keyboardType="numeric"
        autoFocus={true}
        showSoftInputOnFocus={false}
        caretHidden={true}
        contextMenuHidden={true}
        selectTextOnFocus={false}
        editable={isListening}
      />

      {/* GIF Display Area */}
      {currentGif ? (
        <View style={styles.gifContainer}>
          <Image
            source={currentGif}
            style={styles.gif}
            contentFit="cover"
            transition={200}
          />
        </View>
      ) : (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            {isListening
              ? "Press a number on your Bluetooth number pad"
              : "Start listening to use your Bluetooth number pad"}
          </Text>
          <Text style={styles.instructionText}>
            Make sure your Bluetooth number pad is connected in Settings
          </Text>
          {lastPressed && (
            <Text style={styles.selectedText}>
              Last selected: {lastPressed}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  hiddenInput: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  gifContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gif: {
    width: width,
    height: height,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  waitingText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  instructionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 20,
  },
  selectedText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
