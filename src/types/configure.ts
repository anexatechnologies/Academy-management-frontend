export interface Configure {
  id: number
  name: string
  address: string
  phone: string
  service_tax_reg_no: string
  cin_no: string
  logo_url: string
}

export interface ConfigureFormData {
  name: string
  address: string
  phone: string
  service_tax_reg_no?: string
  cin_no?: string
  logo?: File | null
}
