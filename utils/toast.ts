import { Alert } from 'react-native';

export const showSuccess = (message: string, title: string = 'Success') => {
  Alert.alert(title, message);
};

export const showError = (message: string, title: string = 'Error') => {
  Alert.alert(title, message);
};

export const showInfo = (message: string, title: string = 'Info') => {
  Alert.alert(title, message);
};

export const showWarning = (message: string, title: string = 'Warning') => {
  Alert.alert(title, message);
};
