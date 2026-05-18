import type { UploadFile } from 'antd';

export function normFile(e: unknown): UploadFile[] {
  if (Array.isArray(e)) {
    return e;
  }
  return (e as { fileList?: UploadFile[] })?.fileList ?? [];
}

/** Image uploads: ensure thumbUrl so listType="picture" shows a thumbnail (local files, beforeUpload → false). */
export function normImageUpload(e: unknown): UploadFile[] {
  const list = normFile(e);
  return list.map((file) => {
    const raw = file.originFileObj;
    if (raw instanceof Blob && String(raw.type).startsWith('image/')) {
      if (!file.thumbUrl && !file.url) {
        return { ...file, thumbUrl: URL.createObjectURL(raw) };
      }
    }
    return file;
  });
}

export const ROBOT_CREATE_MODAL_WIDTH = 800;
