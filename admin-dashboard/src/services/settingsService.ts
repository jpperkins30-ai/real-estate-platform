import api from './api';

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableEmailNotifications: boolean;
  maintenanceMode: boolean;
  currency: string;
  defaultLanguage: string;
  maxPropertiesPerUser: number;
  maxImagesPerProperty: number;
  allowedPropertyTypes: string[];
  emailTemplates: {
    welcome: string;
    propertyInquiry: string;
    passwordReset: string;
  };
}

export interface UpdateSettingsDto extends Partial<PlatformSettings> {}

export const settingsService = {
  async getSettings(): Promise<PlatformSettings> {
    const response = await api.get<PlatformSettings>('/settings');
    return response.data;
  },

  async updateSettings(data: UpdateSettingsDto): Promise<PlatformSettings> {
    const response = await api.put<PlatformSettings>('/settings', data);
    return response.data;
  },

  async resetSettings(): Promise<PlatformSettings> {
    const response = await api.post<PlatformSettings>('/settings/reset');
    return response.data;
  },

  async updateEmailTemplate(template: keyof PlatformSettings['emailTemplates'], content: string): Promise<PlatformSettings> {
    const response = await api.patch<PlatformSettings>(`/settings/email-templates/${template}`, { content });
    return response.data;
  },
}; 