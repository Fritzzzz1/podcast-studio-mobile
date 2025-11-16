import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../store';
import {
  setDefaultTemplate,
  toggleAutoEnhancement,
  setTheme,
  toggleNotifications,
  toggleHapticFeedback,
  toggleAnalytics,
  toggleCrashReporting,
} from '../store/settingsSlice';
import { selectTemplate } from '../store/templatesSlice';
import { AudioExporter } from '../services';
import { Button } from '../components';
import { theme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const templates = useAppSelector((state) => state.templates.templates);
  const [storageUsed, setStorageUsed] = useState<number>(0);

  React.useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const bytes = await AudioExporter.getExportsStorageUsed();
      setStorageUsed(bytes);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleDefaultTemplateChange = (templateId: string) => {
    dispatch(setDefaultTemplate(templateId));
    dispatch(selectTemplate(templateId));
    Alert.alert('Success', 'Default template updated');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
    Alert.alert('Theme Changed', `Theme set to ${newTheme}`);
  };

  const handleClearExports = async () => {
    Alert.alert(
      'Clear All Exports',
      'Are you sure you want to delete all exported files? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AudioExporter.clearAllExports();
              await loadStorageInfo();
              Alert.alert('Success', 'All exports have been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear exports');
            }
          },
        },
      ]
    );
  };

  const defaultTemplate = templates.find(
    (t) => t.id === settings.defaultTemplateId
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Audio Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Settings</Text>
        <Text style={styles.sectionDesc}>Configure default audio preferences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Template</Text>
            <Text style={styles.settingValue}>
              {defaultTemplate?.name || 'None'}
            </Text>
          </View>
        </View>

        <View style={styles.templateList}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateOption,
                template.id === settings.defaultTemplateId &&
                  styles.templateOptionActive,
              ]}
              onPress={() => handleDefaultTemplateChange(template.id)}
            >
              <Text
                style={[
                  styles.templateOptionText,
                  template.id === settings.defaultTemplateId &&
                    styles.templateOptionTextActive,
                ]}
              >
                {template.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Enhancement</Text>
            <Text style={styles.settingSubtext}>
              Automatically apply audio enhancement after recording
            </Text>
          </View>
          <Switch
            value={settings.autoEnhancement}
            onValueChange={() => dispatch(toggleAutoEnhancement())}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {/* Storage Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Management</Text>
        <Text style={styles.sectionDesc}>Manage recordings and storage</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Exports Storage Used</Text>
            <Text style={styles.settingValue}>
              {AudioExporter.formatFileSize(storageUsed)}
            </Text>
          </View>
        </View>

        <Button
          title="Clear All Exports"
          onPress={handleClearExports}
          variant="outline"
        />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Delete Old Exports</Text>
            <Text style={styles.settingSubtext}>
              Keep last {settings.autoDeleteDays} exports
            </Text>
          </View>
          <Switch
            value={settings.autoDeleteOldRecordings}
            onValueChange={() => {
              // Toggle would be implemented here
              Alert.alert('Info', 'Auto-delete feature coming soon');
            }}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Text style={styles.sectionDesc}>
          Theme, language, and notifications
        </Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
        </View>

        <View style={styles.themeButtons}>
          {(['light', 'dark', 'system'] as const).map((themeOption) => (
            <TouchableOpacity
              key={themeOption}
              style={[
                styles.themeButton,
                settings.theme === themeOption &&
                  styles.themeButtonActive,
              ]}
              onPress={() => handleThemeChange(themeOption)}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  settings.theme === themeOption &&
                    styles.themeButtonTextActive,
                ]}
              >
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>
              {settings.language.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingSubtext}>
              Receive notifications for recordings and exports
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={() => dispatch(toggleNotifications())}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingSubtext}>
              Vibrate on button presses
            </Text>
          </View>
          <Switch
            value={settings.hapticFeedback}
            onValueChange={() => dispatch(toggleHapticFeedback())}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.sectionDesc}>Control data collection</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Analytics</Text>
            <Text style={styles.settingSubtext}>
              Help improve the app by sharing usage data
            </Text>
          </View>
          <Switch
            value={settings.analytics}
            onValueChange={() => dispatch(toggleAnalytics())}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Crash Reporting</Text>
            <Text style={styles.settingSubtext}>
              Send crash reports to help fix bugs
            </Text>
          </View>
          <Switch
            value={settings.crashReporting}
            onValueChange={() => dispatch(toggleCrashReporting())}
            trackColor={{
              false: theme.colors.surface,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Build Number</Text>
          <Text style={styles.settingValue}>2025.01</Text>
        </View>

        <View style={styles.aboutLinks}>
          <TouchableOpacity
            style={styles.aboutLink}
            onPress={() =>
              Alert.alert('Help', 'Help documentation coming soon')
            }
          >
            <Text style={styles.aboutLinkText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aboutLink}
            onPress={() =>
              Alert.alert('Privacy', 'Privacy policy coming soon')
            }
          >
            <Text style={styles.aboutLinkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aboutLink}
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
          >
            <Text style={styles.aboutLinkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  settingSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  settingValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  templateList: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  templateOption: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  templateOptionActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  templateOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  templateOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  themeButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  themeButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  themeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  themeButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  aboutLinks: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  aboutLink: {
    paddingVertical: theme.spacing.sm,
  },
  aboutLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    textAlign: 'center',
  },
});
