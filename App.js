import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import ArmedClock from "./src/components/ArmedClock/Clock";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import store from "./src/store";
import { Provider } from "react-redux";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ArmedClock">
          <Stack.Group>
            <Stack.Screen
              name="ArmedClock"
              component={ArmedClock}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
