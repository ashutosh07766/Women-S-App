import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF4785',
      });
    }

    if (!Device.isDevice) {
      console.log('Must use a physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    const projectId = 'bf6483a5-8fd6-4c95-93b5-26be6cd37999';
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }

  return token;
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { someData: 'goes here' },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Push notification sent successfully:', data);
    } else {
      console.error('❌ Error sending push notification:', data);
    }
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
  }
}
