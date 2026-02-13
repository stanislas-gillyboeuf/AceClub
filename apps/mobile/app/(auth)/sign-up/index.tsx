import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
export default function SignUp() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        await authClient.signUp.email({
                email,
                password,
                name
        })
    };

  return (


    <View>
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold text-blue-500">
              Welcome to Nativewind!
            </Text>
          </View>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
            />
            <Pressable onPress={handleLogin}>
                <Text>Sign Up</Text>
            </Pressable>
        </View>
    );
}
