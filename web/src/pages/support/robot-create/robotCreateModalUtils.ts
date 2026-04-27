import type { UploadFile } from 'antd';

export function normFile(e: unknown): UploadFile[] {
  if (Array.isArray(e)) {
    return e;
  }
  return (e as { fileList?: UploadFile[] })?.fileList ?? [];
}

export const ROBOT_CREATE_MODAL_WIDTH = 800;
