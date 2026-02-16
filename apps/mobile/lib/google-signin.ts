let GoogleSignin: any = null;

try {
  GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
} catch {
  // Native module unavailable (Expo Go)
}

export { GoogleSignin };
