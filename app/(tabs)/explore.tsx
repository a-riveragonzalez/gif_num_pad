// App.tsx
import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import * as Device from 'expo-device';
import { Platform } from 'react-native';


const { width, height } = Dimensions.get('window');

// Types and Interfaces
interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

interface GifMapType {
  [key: number]: ImageSourcePropType;
}

type NumberKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// GIF mapping - replace these with your actual GIF files
const GIF_MAP: GifMapType = {
  1: require('../../assets/gifs/gif1.gif'),
  2: require('../../assets/gifs/gif2.gif'),
  3: require('../../assets/gifs/gif3.gif'),
  4: require('../../assets/gifs/gif4.gif'),
  5: require('../../assets/gifs/gif5.gif'),
  6: require('../../assets/gifs/gif6.gif'),
  7: require('../../assets/gifs/gif7.gif'),
  8: require('../../assets/gifs/gif8.gif'),
  9: require('../../assets/gifs/gif9.gif'),
  0: require('../../assets/gifs/gif0.gif'),
};

// Placeholder GIF for testing (you can replace with actual GIFs)
const PLACEHOLDER_GIF: string = 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif';


export default function TabTwoScreen() {
  const [currentGif, setCurrentGif] = useState<ImageSourcePropType | string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastPressed, setLastPressed] = useState<NumberKey | null>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);

  useEffect(() => {
    initializeBluetooth();
    
    // Cleanup on unmount
    return () => {
      if (bluetoothDevice) {
        disconnectBluetooth();
      }
    };
  }, [bluetoothDevice]);

  const initializeBluetooth = async (): Promise<void> => {
    try {
      // Check if device supports Bluetooth
      if (!Device.isDevice) {
        Alert.alert('Error', 'Bluetooth is not available on this device');
        return;
      }

      // For now, we'll simulate the connection
      // In a real app, you'd use expo-bluetooth or react-native-bluetooth-classic
      console.log('Initializing Bluetooth...');
      
      // Simulate successful connection after 2 seconds
      setTimeout(() => {
        setIsConnected(true);
        Alert.alert('Success', 'Ready to connect to Bluetooth number pad!\n\nFor testing, use the on-screen buttons.');
      }, 2000);

    } catch (error) {
      console.error('Bluetooth initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to initialize Bluetooth: ' + errorMessage);
    }
  };

  const connectToNumberPad = async (): Promise<void> => {
    try {
      Alert.alert(
        'Connect Number Pad',
        'Put your Bluetooth number pad in pairing mode and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Simulate Connection', onPress: simulateConnection },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Connection Error', errorMessage);
    }
  };

  const simulateConnection = (): void => {
    const mockDevice: BluetoothDevice = {
      id: 'mock-device-1',
      name: 'Mock Number Pad',
      address: '00:11:22:33:44:55'
    };
    
    setIsConnected(true);
    setBluetoothDevice(mockDevice);
    Alert.alert('Connected!', 'Bluetooth number pad connected successfully');
  };

  const disconnectBluetooth = (): void => {
    setIsConnected(false);
    setBluetoothDevice(null);
    Alert.alert('Disconnected', 'Bluetooth number pad disconnected');
  };

  const handleNumberPress = (number: NumberKey): void => {
    console.log(`Number pressed: ${number}`);
    setLastPressed(number);
    
    // Get the corresponding GIF
    const gif = GIF_MAP[number];
    if (gif) {
      setCurrentGif(gif);
    } else {
      // Use placeholder for testing
      setCurrentGif(PLACEHOLDER_GIF);
    }

    // Auto-hide GIF after 5 seconds
    setTimeout(() => {
      setCurrentGif(null);
    }, 5000);
  };

  const renderNumberPad = (): JSX.Element => {
    const numbers: NumberKey[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    
    return (
      <View style={styles.numberPadContainer}>
        <Text style={styles.testModeText}>Test Mode - Tap numbers below</Text>
        <View style={styles.numberPad}>
          {numbers.map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                lastPressed === num && styles.numberButtonPressed
              ]}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={styles.numberButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderConnectionStatus = (): JSX.Element => (
    <View style={styles.statusContainer}>
      <View style={[
        styles.statusIndicator,
        { backgroundColor: isConnected ? '#4CAF50' : '#FF5722' }
      ]} />
      <Text style={styles.statusText}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      {!isConnected ? (
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={connectToNumberPad}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.disconnectButton}
          onPress={disconnectBluetooth}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Connection Status */}
      {renderConnectionStatus()}
      
      {/* GIF Display Area */}
      {currentGif ? (
        <View style={styles.gifContainer}>
          <Image
            source={currentGif}
            style={styles.gif}
            contentFit="contain"
            transition={200}
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setCurrentGif(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            {isConnected 
              ? 'Press a number on your number pad or use the test buttons below'
              : 'Connect your Bluetooth number pad to get started'
            }
          </Text>
        </View>
      )}
      
      {/* Test Number Pad (for development) */}
      {isConnected && !currentGif && renderNumberPad()}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#111',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
  },
  connectButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gifContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gif: {
    width: width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  waitingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  numberPadContainer: {
    padding: 20,
    alignItems: 'center',
  },
  testModeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.7,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
  },
  numberButton: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    margin: 5,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  numberButtonPressed: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  numberButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
