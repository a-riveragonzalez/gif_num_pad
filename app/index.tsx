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
import { Video, ResizeMode } from "expo-av";

const { width, height } = Dimensions.get("window");

interface MediaMapType {
  [key: string]: {
    source: ImageSourcePropType | any;
    type: "gif" | "mp4";
  };
}

type NumberKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

// Combined media mapping - GIFs and MP4s
const MEDIA_MAP: MediaMapType = {
  "1": {
    source: require("../assets/gifs/vox_eye_roll.gif"),
    type: "gif",
  },
  "2": {
    source: require("../assets/gifs/vox_face_1.gif"),
    type: "gif",
  },
  "3": {
    source: require("../assets/gifs/vox_red_eye.gif"),
    type: "gif",
  },
  "4": {
    source: require("../assets/gifs/error_screen_1.gif"),
    type: "gif",
  },
  "5": {
    source: require("../assets/gifs/error_screen_2.gif"),
    type: "gif",
  },
  "6": {
    source: require("../assets/gifs/error_screen_3.gif"),
    type: "gif",
  },
  "7": {
    source: require("../assets/videos/alator_take_over_m.mp4"), // Add your MP4 here
    type: "mp4",
  },
  "8": {
    source: require("../assets/videos/laugh_1_m.mp4"), // Add your MP4 here
    type: "mp4",
  },
  "9": {
    source: require("../assets/videos/red_eye.mp4"), // Add your MP4 here
    type: "mp4",
  },
  "0": {
    source: require("../assets/gifs/vox_idle_look.gif"),
    type: "gif",
  },
};

// Placeholder GIF for testing
const PLACEHOLDER_GIF: string =
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";

export default function GifNumberPadApp(): JSX.Element {
  const [currentMedia, setCurrentMedia] = useState<{
    source: ImageSourcePropType | any | string | null;
    type: "gif" | "mp4" | "placeholder";
  } | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastPressed, setLastPressed] = useState<NumberKey | null>(null);
  const [hiddenInput, setHiddenInput] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Add this state to track video readiness:
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Refs for managing input focus
  const hiddenInputRef = useRef<TextInput>(null);

  // Add this to your component (after other refs):

  const videoRef = useRef<Video>(null);

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

  useEffect(() => {
    // Preload all videos when component mounts
    const preloadVideos = async () => {
      Object.values(MEDIA_MAP).forEach((media) => {
        if (media.type === "mp4") {
          // This forces the video to be loaded into memory
          console.log("Preloading video:", media.source);
        }
      });
    };

    preloadVideos();
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
    if (key === "Enter") {
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

    // Get the corresponding media
    const media = MEDIA_MAP[number];
    if (media) {
      setCurrentMedia({
        source: media.source,
        type: media.type,
      });
    } else {
      // Use placeholder for testing
      setCurrentMedia({
        source: PLACEHOLDER_GIF,
        type: "placeholder",
      });
    }
  };

  //   if (currentMedia.type === 'mp4') {
  //     return (
  //       <Video
  //         key={`${lastPressed}-${Date.now()}`}  // Force remount with unique key
  //         source={currentMedia.source}
  //         style={styles.media}
  //         shouldPlay={true}
  //         isLooping={true}
  //         isMuted={false}
  //         resizeMode={ResizeMode.COVER}
  //         useNativeControls={false}
  //         positionMillis={0}  // Start from beginning
  //       />
  //     );
  //   } else {
  //     // Render GIF or placeholder
  //     return (
  //       <Image
  //         source={currentMedia.source}
  //         style={styles.media}
  //         contentFit="cover"
  //         transition={200}
  //       />
  //     );
  //   }
  // };

  const renderMedia = () => {
  if (!currentMedia) return null;

  if (currentMedia.type === 'mp4') {
    return (
      <Video
        ref={videoRef}
        key={`${lastPressed}-${Date.now()}`}
        source={currentMedia.source}
        style={styles.media}
        shouldPlay={false}  // Manual control
        isLooping={true}
        isMuted={false}
        resizeMode={ResizeMode.COVER}
        useNativeControls={false}
        positionMillis={0}
        onLoadStart={() => {
          console.log('Video loading');
          setIsVideoReady(false);
        }}
        onLoad={(status) => {
          console.log('Video loaded', status);
          // Give it a moment to fully buffer
          setTimeout(() => {
            videoRef.current?.playAsync();
          }, 100);
        }}
        onReadyForDisplay={() => {
          console.log('Video ready for display');
          setIsVideoReady(true);
        }}
        onError={(error) => console.error('Video error:', error)}
      />
    );
  } else {
    // Render GIF or placeholder
    return (
      <Image
        source={currentMedia.source}
        style={styles.media}
        contentFit="cover"
        transition={200}
      />
    );
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
        // returnKeyType="done"
        // blurOnSubmit={false}
        // onSubmitEditing={() => {}}
      />

      {/* Media Display Area */}
      {currentMedia ? (
        <View style={styles.mediaContainer}>{renderMedia()}</View>
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
          {/* {lastPressed && (
            <Text style={styles.selectedText}>
              Last selected: {lastPressed}
            </Text>
          )} */}
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
    width: 0,
    height: 0,
    opacity: 0,
    zIndex: -1,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  media: {
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
  // selectedText: {
  //   color: "#4CAF50",
  //   fontSize: 16,
  //   fontWeight: "bold",
  //   textAlign: "center",
  // },
});
