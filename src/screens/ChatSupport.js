import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

const ChatSupport = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: "https://tawk.to/chat/67fa0fede6ecad190d7c9062/1iokcsef0",
        }}
        style={{ flex: 1 }}
      />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeContainer}
      >
        <Ionicons name="close" color={"white"} size={30} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeContainer: {
    position: "absolute",
    top: 25,
    right: 20,
  },
});

export default ChatSupport;
