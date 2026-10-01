let GoogleSignin: any = null;
let GoogleSigninButton: any = null;

try {
  const nativeModule = require("@react-native-google-signin/google-signin");
  GoogleSignin = nativeModule.GoogleSignin;
  GoogleSigninButton = nativeModule.GoogleSigninButton;
} catch {
  // Native module unavailable (Expo Go)
}

export { GoogleSignin, GoogleSigninButton };
