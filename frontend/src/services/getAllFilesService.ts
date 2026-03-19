import { getConstants } from "@/constants";

export const getAllFilesService = async (
  folderId?: number | null,
  all: boolean = false
) => {
  const { url } = getConstants();

  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  let queryParams = "";
  if (all) {
    queryParams = "?all=true";
  } else if (folderId !== undefined && folderId !== null) {
    queryParams = `?folderId=${folderId}`;
  }

  const response = await fetch(`${url}/files${queryParams}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.files;
};