"use client";

import { getConstants } from "@/constants";
import { makeLinkRedirect } from "@/helper/makeLinkRedirect";
import { truncateString } from "@/helper/truncateString";
import { getAllFilesService } from "@/services/getAllFilesService";
import { uploadFiles } from "@/services/uploadFiles";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function Home() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState("todos");

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

  const filteredFiles = useMemo(() => {
    if (filterType === "todos") return uploadedFiles;
    return uploadedFiles.filter((file) => getFileType(file.fileName) === filterType);
  }, [uploadedFiles, filterType]);

  const handleChange = async (event) => {
    try {
      setIsUploading(true);
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setFiles([...files]);

      const response = await uploadFiles(files[0]);

      setUploadedFiles((uploadedFiles) => [...uploadedFiles, response]);

      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
      router.push("/login");
    } finally {
      setIsUploading(false);
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
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);
    if (!token) {
      router.push("/login");
      return;
    }

    getAllFilesService()
      .then((response) => {
        setUploadedFiles([...response]);
      })
      .catch((error) => {
        console.error("Failed to load files:", error);
        router.push("/login");
      });
  }, [router]);

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 w-full h-16 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center">
          <h1 className="font-bold text-2xl text-white">📁 Simple Storage</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="bg-white bg-opacity-15 px-4 py-2 rounded-full border border-white border-opacity-20 flex items-center space-x-2 shadow-inner">
            <span className="text-white text-xs font-semibold uppercase tracking-wider opacity-80">
              Total de Arquivos:
            </span>
            <span className="text-white text-xl font-bold leading-none">
              {uploadedFiles.length}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm font-medium">Bem-vindo!</span>
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Meus Arquivos
            </h2>

            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 hidden md:block">
                Filtrar por
              </span>
              <div className="flex gap-1">
                {[
                  { id: "todos", label: "Todos", icon: "📁" },
                  { id: "imagem", label: "Imagens", icon: "🖼️" },
                  { id: "documento", label: "Docs", icon: "📝" },
                  { id: "outros", label: "Outros", icon: "📄" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${filterType === item.id
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {/* Upload em progresso */}
            {files.map((file) => (
              <div
                key={file.name}
                className="bg-white border-2 border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm animate-pulse"
              >
                <div className="text-blue-500 text-3xl mb-2">⏳</div>
                <p className="text-sm text-center text-gray-600 mb-2">
                  {truncateString(file.name, 20)}
                </p>
                <p className="text-xs text-blue-500">Carregando...</p>
              </div>
            ))}

            {/* Arquivos carregados */}
            {filteredFiles.map((file) => {
              const type = getFileType(file.fileName);
              let icon = "📄";
              let colorClass = "text-gray-500";
              let borderColor = "border-gray-200";
              let hoverBorderColor = "hover:border-gray-300";

              if (type === "imagem") {
                icon = "🖼️";
                colorClass = "text-blue-500";
                borderColor = "border-blue-200";
                hoverBorderColor = "hover:border-blue-300";
              } else if (type === "documento") {
                icon = "📝";
                colorClass = "text-green-500";
                borderColor = "border-green-200";
                hoverBorderColor = "hover:border-green-300";
              }

              return (
                <div
                  key={file.fileName}
                  onClick={() =>
                    window.open(makeLinkRedirect(file.fileName), "_blank")
                  }
                  className={`bg-white border-2 ${borderColor} ${hoverBorderColor} rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
                >
                  <div
                    className={`${colorClass} text-3xl mb-2 group-hover:scale-110 transition-transform duration-200`}
                  >
                    {icon}
                  </div>
                  <p className="text-sm text-center text-gray-700 font-medium">
                    {truncateString(
                      file.fileName?.split("_")[2] || file.fileName,
                      20
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Clique para abrir</p>
                </div>
              );
            })}

            {/* Área de upload */}
            <div className="bg-white border-2 border-dashed border-amber-400 hover:border-amber-500 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-amber-50 group">
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                {isUploading ? (
                  <>
                    <div className="text-amber-500 text-3xl mb-2 animate-spin">
                      ⚙️
                    </div>
                    <p className="text-sm text-center text-amber-600 font-medium">
                      Enviando arquivo...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-amber-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                      📤
                    </div>
                    <p className="text-sm text-center text-gray-600 font-medium mb-1">
                      Adicionar arquivo
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      Clique para selecionar
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

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">🔍</div>
              <p className="text-xl text-gray-500 mb-2">
                Nenhum arquivo encontrado para este filtro
              </p>
              <p className="text-gray-400">
                Tente selecionar outro tipo de arquivo ou adicione um novo!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}