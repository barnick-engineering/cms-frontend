export interface CreatedBy {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface CustomerFormInterface {
  name: string;
  email?: string;
  phone: string;
  address: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  is_company?: boolean;
  remarks?: string | null;
}

export interface Customer {
  id: number;
  created: string;
  status: boolean;
  created_by?: CreatedBy;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person_name: string;
  contact_person_phone?: string | null;
  is_company?: boolean;
  remarks: string | null;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  prev_url: string | null;
  next_url: string | null;
  page_size: number;
  response_code: number;
  response_message: string;
}

export type CustomerListInterface = Customer

export interface CustomerMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Customer
  onSave?: (updatedData: CustomerFormInterface) => void
}

export interface DataTablePropsInterface {
  data: CustomerListInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string) => void
  rowSelection?: Record<string, boolean>
}