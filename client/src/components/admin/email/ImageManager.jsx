"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import config from "../../../config/config"
import { toPublicImageUrl } from "../../../utils/emailImageUrl"
import { describeApiError } from "../../../utils/apiError"

/**
 * The image library: folders of pictures to drop into an email.
 *
 * Opened two ways. On its own it is a place to tidy images up; opened from an
 * image block it is a picker, and `onPick` is what tells it which it is.
 *
 * Addresses handed back are absolute. An email is opened days later on somebody
 * else's machine, where a path beginning with /uploads means nothing.
 */

const getToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

/**
 * For showing a thumbnail in this panel -- whichever API this browser talks to
 * is the right place to load it from.
 */
const absolute = (url) => (url?.startsWith("http") ? url : `${config.API_URL}${url}`)

const readableSize = (bytes) => {
  if (!bytes) return "0 KB"
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const ImageManager = ({ open, onClose, onPick }) => {
  const [folder, setFolder] = useState("")
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [usage, setUsage] = useState({ bytes: 0, files: 0 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [newFolder, setNewFolder] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const auth = { headers: { Authorization: `Bearer ${getToken()}` } }

  const load = useCallback(
    async (target = folder) => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${config.API_URL}/api/media`, {
          ...auth,
          params: { folder: target || undefined },
        })
        setFolders(data.folders || [])
        setFiles(data.files || [])
        setUsage(data.usage || { bytes: 0, files: 0 })
      } catch (e) {
        setError(describeApiError(e, "Could not open the image library"))
      } finally {
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [folder],
  )

  useEffect(() => {
    if (open) load(folder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folder])

  const upload = async (list) => {
    const chosen = Array.from(list || []).filter((file) => file.type.startsWith("image/"))
    if (chosen.length === 0) return
    setError("")
    setBusy(true)
    try {
      const body = new FormData()
      chosen.forEach((file) => body.append("images", file))
      const { data } = await axios.post(`${config.API_URL}/api/media/upload`, body, {
        ...auth,
        params: { folder: folder || undefined },
      })
      setNotice(`${data.files.length} image${data.files.length === 1 ? "" : "s"} uploaded.`)
      await load(folder)
    } catch (e) {
      setError(describeApiError(e, "The upload failed"))
    } finally {
      setBusy(false)
    }
  }

  const createFolder = async () => {
    const name = newFolder.trim()
    if (!name) return
    try {
      await axios.post(`${config.API_URL}/api/media/folder`, { name }, auth)
      setNewFolder("")
      setShowNewFolder(false)
      await load("")
    } catch (e) {
      setError(describeApiError(e, "Could not create the folder"))
    }
  }

  const deleteFile = async (name) => {
    if (!window.confirm(`Delete "${name}"? Any email already using it will show a broken image.`)) return
    try {
      await axios.delete(`${config.API_URL}/api/media/file`, { ...auth, params: { folder: folder || undefined, name } })
      await load(folder)
    } catch (e) {
      setError(describeApiError(e, "Could not delete the image"))
    }
  }

  const deleteFolder = async (name, count) => {
    const warning =
      count > 0
        ? `"${name}" holds ${count} image${count === 1 ? "" : "s"}. Delete the folder and everything in it?`
        : `Delete the folder "${name}"?`
    if (!window.confirm(warning)) return
    try {
      await axios.delete(`${config.API_URL}/api/media/folder`, {
        ...auth,
        params: { name, force: count > 0 ? "true" : undefined },
      })
      await load("")
    } catch (e) {
      setError(describeApiError(e, "Could not delete the folder"))
    }
  }

  const copyAddress = async (url) => {
    try {
      await navigator.clipboard.writeText(absolute(url))
      setNotice("Address copied.")
    } catch {
      setError("Could not copy the address.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* ---- header ---- */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            {folder && (
              <button
                type="button"
                onClick={() => setFolder("")}
                className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
                aria-label="Back to all folders"
              >
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ImageIcon size={18} className="text-lime-600" />
                {folder || "Image Manager"}
              </h2>
              <p className="text-xs text-gray-500">
                {usage.files} image{usage.files === 1 ? "" : "s"} · {readableSize(usage.bytes)} used
                {onPick ? " · click an image to use it" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* ---- toolbar ---- */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-2.5">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md bg-lime-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-lime-600 disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {busy ? "Uploading…" : "Upload"}
          </button>

          {!folder && (
            <button
              type="button"
              onClick={() => setShowNewFolder((s) => !s)}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FolderPlus size={14} />
              New folder
            </button>
          )}

          {showNewFolder && (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                placeholder="Folder name"
                className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-lime-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={createFolder}
                className="rounded-md bg-gray-900 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Create
              </button>
            </div>
          )}

          <span className="ml-auto text-xs text-gray-400">Drag images anywhere below to upload</span>
        </div>

        {error && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-700">
              <X size={15} />
            </button>
          </div>
        )}
        {notice && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5 text-sm text-green-700">
            <Check size={15} />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice("")} className="text-green-500 hover:text-green-800">
              <X size={15} />
            </button>
          </div>
        )}

        {/* ---- body ---- */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            upload(e.dataTransfer.files)
          }}
          className={`flex-1 overflow-y-auto p-5 ${dragOver ? "bg-lime-50 outline-dashed outline-2 outline-lime-400" : ""}`}
        >
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-lime-600" />
            </div>
          ) : (
            <>
              {folders.length > 0 && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {folders.map((item) => (
                    <div
                      key={item.name}
                      className="group relative cursor-pointer rounded-lg border border-gray-200 p-3 text-center hover:border-lime-400 hover:bg-lime-50"
                      onClick={() => setFolder(item.name)}
                    >
                      <Folder size={28} className="mx-auto text-lime-600" />
                      <p className="mt-1.5 truncate text-xs font-medium text-gray-800">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{item.count} file{item.count === 1 ? "" : "s"}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFolder(item.name, item.count)
                        }}
                        className="absolute right-1 top-1 hidden rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 group-hover:block"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length === 0 && folders.length === 0 ? (
                <div className="py-16 text-center">
                  <ImageIcon size={32} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-500">No images here yet</p>
                  <p className="mt-1 text-xs text-gray-400">Drag images in, or press Upload.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 ${
                        onPick ? "cursor-pointer hover:border-lime-500" : ""
                      }`}
                      // The panel shows it from the local API; the email gets
                      // the public address, or the picture is broken for every
                      // recipient.
                      onClick={() => onPick && onPick(toPublicImageUrl(absolute(file.url)))}
                    >
                      <img src={absolute(file.url)} alt={file.name} className="h-28 w-full object-contain" />
                      <div className="border-t border-gray-100 bg-white px-2 py-1.5">
                        <p className="truncate text-[11px] font-medium text-gray-700">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{readableSize(file.size)}</p>
                      </div>
                      <div className="absolute right-1 top-1 hidden gap-0.5 group-hover:flex">
                        <button
                          type="button"
                          title="Copy address"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyAddress(file.url)
                          }}
                          className="rounded bg-white/90 p-1 text-gray-500 shadow hover:text-gray-900"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFile(file.name)
                          }}
                          className="rounded bg-white/90 p-1 text-gray-500 shadow hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {onPick && (
                        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-lime-600/80 text-xs font-bold text-white group-hover:flex">
                          Use this image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageManager
