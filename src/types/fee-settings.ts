export type FeeMode = "one-time" | "monthly"

export interface FeeSettings {
  fee_mode: FeeMode
  tax_percentage: string
  monthly_tax_percentage: string
}

export interface FeeSettingsResponse {
  status: string
  data: FeeSettings
}

export interface UpdateFeeSettingsPayload {
  settings: {
    fee_mode: FeeMode
    tax_percentage: string
    monthly_tax_percentage: string
  }
}
