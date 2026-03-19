import { getConstants } from "@/constants";

export const createFolder = async (name: string, parentId?: number | null) => {
  const { url } = getConstants();
  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const response = await fetch(`${url}/folder/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, parentId }),
  });

  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(data.message || "Failed to create folder");
  }

  return data.folder;
};

export const listFolders = async () => {
  const { url } = getConstants();
  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const response = await fetch(`${url}/folders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(data.message || "Failed to list folders");
  }

  return data.folders;
};