export interface FileRecord {
  name: string
  file_name: string
  file_url: string
  is_private: boolean | 0 | 1
  creation: string
  attached_to_doctype: string
  attached_to_name: string
}

export interface UploadFilePayload {
  file: File
  is_private: boolean
}
