import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="inicial/index"
        options={{
          title: 'Inicial',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      
      
    </Tabs>
  );
}