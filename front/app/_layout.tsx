
import React from "react";
import { Slot, Stack } from "expo-router";
import { UserProvider } from "@/service/context.provider";

export default function RootLayout() {
  return (
    <UserProvider>
        <Slot /> 
    </UserProvider>
  );
}
