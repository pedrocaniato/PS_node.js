"use client";

import { getConstants } from "@/constants";
import { makeLinkRedirect } from "@/helper/makeLinkRedirect";
import { truncateString } from "@/helper/truncateString";
import { getAllFilesService } from "@/services/getAllFilesService";
import { uploadFiles } from "@/services/uploadFiles";
import { createFolder, listFolders } from "@/services/folderService";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, ChangeEvent } from "react";

interface FileItem {
  id: number;
  fileName: string;
  userId: number;
  folderId?: number | null;
}

interface FolderItem {
  id: number;
  name: string;
  userId: number;
  parentId: number | null;
}

export default function Home() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState("todos");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isImage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
      ext || ""
    );
  };

  const isDocument = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return [
      "pdf",
      "doc",
      "docx",
      "txt",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "odt",
      "ods",
    ].includes(ext || "");
  };

  const getFileType = (fileName: string) => {
    if (isImage(fileName)) return "imagem";
    if (isDocument(fileName)) return "documento";
    return "outros";
  };

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => folder.parentId === currentFolderId);
  }, [folders, currentFolderId]);

  const filteredFiles = useMemo(() => {
    if (filterType === "todos") return uploadedFiles;
    return uploadedFiles.filter(
      (file) => getFileType(file.fileName) === filterType
    );
  }, [uploadedFiles, filterType]);

  const breadcrumbs = useMemo(() => {
    const crumbs: FolderItem[] = [];
    let currentId = currentFolderId;

    while (currentId !== null) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return crumbs;
  }, [folders, currentFolderId]);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadError(null);
      setIsUploading(true);
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      const selectedFiles = Array.from(fileList) as File[];
      setFiles(selectedFiles);

      const response = await uploadFiles(selectedFiles[0], currentFolderId);

      setUploadedFiles((uploadedFiles) => [...uploadedFiles, response]);
      setTotalFiles((prev) => prev + 1);

      setFiles([]);
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      setUploadError(message || "Erro ao fazer upload do arquivo.");
      setFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const newFolder: FolderItem = await createFolder(
        newFolderName,
        currentFolderId
      );
      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      setUploadError(message || "Erro ao criar pasta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(getConstants().LOCAL_STORAGE_TOKEN);
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([listFolders(), getAllFilesService(null, true)])
      .then(([foldersRes, allFilesRes]) => {
        setFolders(foldersRes);
        setTotalFiles(allFilesRes.length);
      })
      .catch((error) => console.error("Initial load failed:", error));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);
    if (!token) return;

    getAllFilesService(currentFolderId)
      .then((response) => {
        setUploadedFiles([...response]);
      })
      .catch((error) => {
        console.error("Failed to load files:", error);
      });
  }, [currentFolderId]);

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 w-full h-16 flex items-center justify-between px-6 shadow-md shrink-0 border-b border-amber-400">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
            <span className="text-xl">📁</span>
          </div>
          <h1 className="font-black text-2xl text-white tracking-tight">
            Simple Storage
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="bg-white bg-opacity-15 px-4 py-2 rounded-full border border-white border-opacity-20 flex items-center space-x-2 shadow-inner">
            <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">
              Arquivos
            </span>
            <span className="text-white text-xl font-bold leading-none">
              {totalFiles}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-amber-600 font-bold text-xs uppercase">
              U
            </div>
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-bold border border-white border-opacity-10"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar with Navigation and Actions */}
          <div className="flex flex-col space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <nav className="flex items-center space-x-2 text-sm font-bold">
                  <button
                    onClick={() => setCurrentFolderId(null)}
                    className={`flex items-center transition-colors ${
                      currentFolderId === null
                        ? "text-amber-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span>Home</span>
                  </button>
                  {breadcrumbs.map((crumb) => (
                    <div key={crumb.id} className="flex items-center space-x-2">
                      <span className="text-gray-300">/</span>
                      <button
                        onClick={() => setCurrentFolderId(crumb.id)}
                        className={`transition-colors ${
                          currentFolderId === crumb.id
                            ? "text-amber-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {crumb.name}
                      </button>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 hidden md:block">
                  Filtrar por
                </span>
                <div className="flex gap-1">
                  {[
                    { id: "todos", label: "Todos", icon: "📦" },
                    { id: "imagem", label: "Imagens", icon: "🖼️" },
                    { id: "documento", label: "Docs", icon: "📝" },
                    { id: "outros", label: "Outros", icon: "📄" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFilterType(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${
                        filterType === item.id
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-100"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-amber-500 text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all shadow-sm active:scale-95"
              >
                <span>➕</span> Nova Pasta
              </button>
            </div>
          </div>

          {/* New Folder Input Overlay (Inline) */}
          {isCreatingFolder && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 shadow-inner flex flex-col sm:flex-row items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Nome da pasta..."
                  className="w-full bg-white border-2 border-amber-100 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400 focus:ring-opacity-10 transition-all"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 sm:flex-none px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Criar
                </button>
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="flex-1 sm:flex-none px-6 py-2 bg-white text-gray-400 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors border-2 border-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Feedback de erro */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm font-bold text-red-800 tracking-tight">
                  {uploadError}
                </p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="text-red-400 hover:text-red-500 transition-colors p-1"
                title="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {/* Pastas */}
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="bg-white border-2 border-amber-100 hover:border-amber-400 rounded-2xl p-5 flex flex-col items-center justify-center h-44 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                  📁
                </div>
                <p className="text-sm text-center text-gray-800 font-black tracking-tight leading-tight px-2">
                  {truncateString(folder.name, 24)}
                </p>
                <div className="mt-2 text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir Pasta
                </div>
              </div>
            ))}

            {/* Upload em progresso */}
            {files.map((file) => (
              <div
                key={file.name}
                className="bg-white border-2 border-blue-100 rounded-2xl p-5 flex flex-col items-center justify-center h-44 shadow-sm animate-pulse"
              >
                <div className="text-4xl mb-3 animate-bounce">⏳</div>
                <p className="text-sm font-bold text-center text-gray-600 px-2">
                  {truncateString(file.name, 20)}
                </p>
                <div className="mt-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Carregando...
                </div>
              </div>
            ))}

            {/* Arquivos carregados */}
            {filteredFiles.map((file) => {
              const type = getFileType(file.fileName);
              let icon = "📄";
              let colorClass = "text-gray-400";
              let iconBg = "bg-gray-50";

              if (type === "imagem") {
                icon = "🖼️";
                colorClass = "text-blue-500";
                iconBg = "bg-blue-50";
              } else if (type === "documento") {
                icon = "📝";
                colorClass = "text-emerald-500";
                iconBg = "bg-emerald-50";
              }

              return (
                <div
                  key={file.fileName}
                  onClick={() =>
                    window.open(makeLinkRedirect(file.fileName), "_blank")
                  }
                  className="bg-white border-2 border-transparent hover:border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center h-44 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  <div
                    className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                  >
                    {icon}
                  </div>
                  <p className="text-sm text-center text-gray-800 font-bold tracking-tight px-2">
                    {truncateString(
                      file.fileName?.split("_")[2] || file.fileName,
                      22
                    )}
                  </p>
                  <div className="mt-2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                    Visualizar
                  </div>
                </div>
              );
            })}

            {/* Área de upload */}
            <div className="bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-5 flex flex-col items-center justify-center h-44 shadow-sm hover:shadow-xl hover:bg-amber-50 transition-all duration-300 cursor-pointer group scroll-mt-4">
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                {isUploading ? (
                  <>
                    <div className="text-amber-500 text-4xl mb-3 animate-spin">
                      ⚙️
                    </div>
                    <p className="text-sm text-center text-amber-600 font-black tracking-tight uppercase">
                      Processando...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-3xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-inner text-amber-600">
                      📤
                    </div>
                    <p className="text-sm text-center text-gray-800 font-bold tracking-tight">
                      Adicionar
                    </p>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">
                      Selecionar
                    </p>
                  </>
                )}
                <input
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={handleChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {filteredFiles.length === 0 && filteredFolders.length === 0 && (
            <div className="text-center py-24 animate-in fade-in duration-700">
              <div className="text-7xl text-gray-200 mb-6 grayscale opacity-50">
                📂
              </div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">
                Esta pasta está vazia
              </h3>
              <p className="text-gray-400 font-medium max-w-sm mx-auto">
                Adicione novos arquivos ou crie pastas para organizar seus
                documentos.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}