import { getConstants } from "@/constants";

export const uploadFiles = async (file: File, folderId?: number | null) => {
  if (!file) throw Error("Files not Found");

  const { url } = getConstants();

  const formData = new FormData();
  if (folderId) {
    formData.append("folderId", folderId.toString());
  }
  formData.append("file", file);

  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token || ""}`,
  };

  const response = await fetch(`${url}/file/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.file;
};