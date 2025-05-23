import { initializeDataBase } from "@/database/initializeDataBase";
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { ThemeProvider } from '../context/ThemeContext';

export default function Layout() {
  return (
    <SQLiteProvider databaseName="myDataBase.db" onInit={initializeDataBase}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen
            name="Index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Consultar"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Configurar"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}