export interface MessagingSettings {
  grouped: {
    messaging_master: {
      messaging_master_enabled: string;
    };
    alerts: {
      sms_enabled: string;
      whatsapp_enabled: string;
    };
    messaging_triggers: Record<string, string>;
  };
}

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  address: string;
  is_active: boolean;
  opening_balance: string;
  remark?: string;
}

export interface BiometricDevice {
  id: number;
  name: string;
  ip_address: string;
  port: number;
  password?: string;
  is_active: boolean;
}
