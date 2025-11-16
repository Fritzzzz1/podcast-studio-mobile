/**
 * Reusable dialog and alert utilities
 */

import { Alert, AlertButton } from 'react-native';

/**
 * Show a confirmation dialog before deleting
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback when user confirms
 * @param onCancel - Optional callback when user cancels
 */
export const showDeleteConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Show an error alert
 * @param title - Error title
 * @param message - Error message
 * @param onDismiss - Optional callback when dismissed
 */
export const showErrorAlert = (
  title: string,
  message: string,
  onDismiss?: () => void
): void => {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
};

/**
 * Show a success alert
 * @param title - Success title
 * @param message - Success message
 * @param onDismiss - Optional callback when dismissed
 */
export const showSuccessAlert = (
  title: string,
  message: string,
  onDismiss?: () => void
): void => {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
};

/**
 * Show a general confirmation dialog
 * @param title - Dialog title
 * @param message - Dialog message
 * @param confirmText - Text for confirm button (default: 'Confirm')
 * @param cancelText - Text for cancel button (default: 'Cancel')
 * @param onConfirm - Callback when user confirms
 * @param onCancel - Optional callback when user cancels
 * @param destructive - Whether confirm action is destructive (default: false)
 */
export const showConfirmation = (
  title: string,
  message: string,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel',
  onConfirm: () => void,
  onCancel?: () => void,
  destructive: boolean = false
): void => {
  const buttons: AlertButton[] = [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ];

  Alert.alert(title, message, buttons, { cancelable: true });
};

/**
 * Show an info alert
 * @param title - Info title
 * @param message - Info message
 * @param onDismiss - Optional callback when dismissed
 */
export const showInfoAlert = (
  title: string,
  message: string,
  onDismiss?: () => void
): void => {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
};

/**
 * Show a choice dialog with multiple options
 * @param title - Dialog title
 * @param message - Dialog message
 * @param options - Array of options with text and onPress
 * @param cancelable - Whether dialog can be cancelled by tapping outside (default: true)
 */
export const showChoiceDialog = (
  title: string,
  message: string,
  options: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>,
  cancelable: boolean = true
): void => {
  Alert.alert(title, message, options as AlertButton[], { cancelable });
};
