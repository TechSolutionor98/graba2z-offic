"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlignEndHorizontal,
  Code,
  Columns,
  Copy,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Heading,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  Monitor,
  MousePointerClick,
  MoveVertical,
  Play,
  Redo2,
  Share2,
  ShoppingBag,
  Ticket,
  Smartphone,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react"

import BlockSettings, { ColorField, Field, NumberField, inputClass } from "./BlockSettings"
import RichTextEditor from "./RichTextEditor"
import {
  BLOCK_LIBRARY,
  DEFAULT_SETTINGS,
  blockSummary,
  createBlock,
  newId,
  renderBlockInner,
  renderEmailHtml,
} from "../../../utils/emailBlocks"

/**
 * The email constructor: a full-screen editor with the blocks you can add down
 * the left, the email in the middle, and the settings for whatever is selected
 * on the right.
 *
 * Two decisions shape it:
 *
 * 1. **The canvas is the email.** Every block is drawn with the very same
 *    function that produces the sent HTML, so what is on screen cannot drift
 *    from what arrives. Text is edited where it appears, not in a side panel --
 *    nobody can judge a line of copy in a form field.
 *
 * 2. **Dragging is the browser's own.** Two levels of nesting and a short list
 *    do not justify a drag-and-drop dependency to keep current.
 */

const ICONS = {
  Heading, Type, List, Image: ImageIcon, MousePointerClick, Play,
  Columns, Minus, MoveVertical, ShoppingBag, Ticket, Share2, AlignEndHorizontal, Code,
}

const clone = (value) => JSON.parse(JSON.stringify(value))

/**
 * These three live out here, not inside EmailBuilder, and that is not a style
 * choice. A component declared inside another is a new function on every render,
 * so React sees a different component type each time and throws the old subtree
 * away. For a div that is invisible; for the text editor it meant the editor was
 * destroyed and rebuilt on every keystroke, so it could never hold focus and the
 * text appeared uneditable.
 */

const DropLine = ({ index, active, onEnter, onLeave, onDrop }) => (
  <div
    onDragOver={(e) => {
      e.preventDefault()
      onEnter(index)
    }}
    onDragLeave={() => onLeave(index)}
    onDrop={(e) => {
      e.preventDefault()
      onDrop(index)
    }}
    className={`relative -my-1 h-3 transition-colors ${active ? "bg-lime-400" : ""}`}
  />
)

/** A block on the canvas: its real markup, or an editor when it is text. */
const BlockBody = ({ block, settings, width, editing, onPatch }) => {
  if (editing && ["heading", "text"].includes(block.type)) {
    return (
      // Clicks inside the editor must not reach the wrapper, which would
      // re-select the block and pull the caret out from under the typing.
      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <RichTextEditor
          inline
          value={block.html ?? `<p>${block.text || ""}</p>`}
          onChange={(html) => onPatch({ html })}
          style={{
            fontFamily: settings.fontFamily,
            fontSize: block.size,
            lineHeight: block.lineHeight,
            color: block.color,
            textAlign: block.align,
            fontWeight: block.type === "heading" ? block.weight : "normal",
          }}
        />
      </div>
    )
  }

  const rendered = renderBlockInner(block, settings, width)
  if (rendered) return <div dangerouslySetInnerHTML={{ __html: rendered }} />

  // An empty block renders to nothing, which on the canvas looks like a bug
  // rather than a slot waiting to be filled. A picture-shaped panel says what
  // belongs here and how big it will be. It exists only in the builder -- the
  // sent email still contains nothing, so an image deliberately left out does
  // not become a grey box in somebody's inbox.
  if (block.type === "image" || block.type === "video") {
    return (
      <div className="flex min-h-[150px] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-center">
        <ImageIcon size={26} className="text-gray-400" />
        <p className="text-sm font-semibold text-gray-600">
          {block.type === "video" ? "Add a video thumbnail" : "Add your picture here"}
        </p>
        <p className="text-xs text-gray-400">Click to choose or upload one</p>
      </div>
    )
  }

  return (
    <p className="m-0 text-[13px] italic text-gray-400">Empty {block.type} — click to set it up</p>
  )
}

const FloatingActions = ({ canMoveUp, canMoveDown, onDuplicate, onMoveUp, onMoveDown, onDelete, onDragStart, onDragEnd }) => (
  <div className="absolute -bottom-3.5 right-2 z-20 flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-0.5 shadow-md">
    {/* The handle, not the whole block, is what starts a drag. Making the block
        itself draggable fought with selecting and with editing its text, so a
        selected block could not be moved at all -- which is exactly when you
        want to move it. */}
    <span
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => e.stopPropagation()}
      title="Drag to move"
      className="cursor-grab rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
    >
      <GripVertical size={14} />
    </span>
    {[
      { Icon: ChevronUp, title: "Move up", action: onMoveUp, disabled: !canMoveUp },
      { Icon: ChevronDown, title: "Move down", action: onMoveDown, disabled: !canMoveDown },
      { Icon: Copy, title: "Duplicate", action: onDuplicate },
    ].map(({ Icon, title, action, disabled }) => (
      <button
        key={title}
        type="button"
        title={title}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          action()
        }}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
      >
        <Icon size={14} />
      </button>
    ))}
    <button
      type="button"
      title="Delete"
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
      className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={14} />
    </button>
  </div>
)

const EmailBuilder = ({ blocks, settings, onChange, meta, onMetaChange, onSave, onClose, saving, dirty, extraActions }) => {
  const [selected, setSelected] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [device, setDevice] = useState("desktop")
  const [previewing, setPreviewing] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [panel, setPanel] = useState("block")

  const dragging = useRef(null)
  const past = useRef([])
  const future = useRef([])
  const lastCommitKey = useRef(null)
  const [, bumpHistory] = useState(0)

  /**
   * Record a change, with one snapshot of what it replaced.
   *
   * `key` groups a run of changes into a single undo step. Typing fires a change
   * per keystroke; without this, undo would walk back one character at a time
   * and fifty characters would push every real edit out of the history.
   */
  const commit = useCallback(
    (nextBlocks, nextSettings = settings, key = null) => {
      const continuing = key !== null && key === lastCommitKey.current
      if (!continuing) {
        past.current = [...past.current.slice(-49), { blocks: clone(blocks), settings: clone(settings) }]
      }
      lastCommitKey.current = key
      future.current = []
      bumpHistory((t) => t + 1)
      onChange({ blocks: nextBlocks, settings: nextSettings })
    },
    [blocks, settings, onChange],
  )

  const undo = useCallback(() => {
    const previous = past.current.pop()
    if (!previous) return
    future.current = [{ blocks: clone(blocks), settings: clone(settings) }, ...future.current]
    bumpHistory((t) => t + 1)
    onChange(previous)
  }, [blocks, settings, onChange])

  const redo = useCallback(() => {
    const [next, ...rest] = future.current
    if (!next) return
    future.current = rest
    past.current = [...past.current, { blocks: clone(blocks), settings: clone(settings) }]
    bumpHistory((t) => t + 1)
    onChange(next)
  }, [blocks, settings, onChange])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && previewing) return setPreviewing(false)
      if (!(e.metaKey || e.ctrlKey)) return
      const tag = document.activeElement?.tagName
      const editing = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable
      if (e.key.toLowerCase() === "s") {
        e.preventDefault()
        onSave?.()
        return
      }
      // Let a field's own undo work; this one is for the document.
      if (e.key.toLowerCase() === "z" && !editing) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo, onSave, previewing])

  // ---- reading and writing -------------------------------------------------

  // Selecting anything closes off the current typing run, so the next edit is a
  // separate undo step rather than joining the previous block's.
  const select = (next) => {
    lastCommitKey.current = null
    setSelected(next)
  }

  const activeBlock = (() => {
    if (!selected) return null
    const parent = blocks.find((b) => b.id === selected.blockId)
    if (!parent) return null
    if (selected.childId == null) return parent
    return parent.columns?.[selected.columnIndex]?.blocks.find((b) => b.id === selected.childId) || null
  })()

  const updateSelected = (patch) => {
    if (!selected) return
    commit(
      blocks.map((block) => {
        if (block.id !== selected.blockId) return block
        if (selected.childId == null) return { ...block, ...patch }
        return {
          ...block,
          columns: block.columns.map((column, index) =>
            index !== selected.columnIndex
              ? column
              : { ...column, blocks: column.blocks.map((c) => (c.id === selected.childId ? { ...c, ...patch } : c)) },
          ),
        }
      }),
    )
  }

  /** Edit a block directly on the canvas, without selecting it first. */
  const patchBlock = (blockId, columnIndex, childId, patch) => {
    // A run of typing in one block is one undo step; everything else is its own.
    const typing = Object.keys(patch).length === 1 && patch.html !== undefined
    const key = typing ? `type:${blockId}:${childId ?? ""}` : null
    commit(
      blocks.map((block) => {
        if (block.id !== blockId) return block
        if (childId == null) return { ...block, ...patch }
        return {
          ...block,
          columns: block.columns.map((column, index) =>
            index !== columnIndex
              ? column
              : { ...column, blocks: column.blocks.map((c) => (c.id === childId ? { ...c, ...patch } : c)) },
          ),
        }
      }),
      settings,
      key,
    )
  }

  const removeBlock = (blockId, columnIndex, childId) => {
    commit(
      childId == null
        ? blocks.filter((b) => b.id !== blockId)
        : blocks.map((b) =>
            b.id !== blockId
              ? b
              : {
                  ...b,
                  columns: b.columns.map((c, i) =>
                    i !== columnIndex ? c : { ...c, blocks: c.blocks.filter((x) => x.id !== childId) },
                  ),
                },
          ),
    )
    setSelected(null)
  }

  const duplicateBlock = (blockId) => {
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index < 0) return
    const copy = clone(blocks[index])
    copy.id = newId()
    if (copy.columns) {
      copy.columns = copy.columns.map((c) => ({ ...c, id: newId(), blocks: c.blocks.map((b) => ({ ...b, id: newId() })) }))
    }
    const next = [...blocks]
    next.splice(index + 1, 0, copy)
    commit(next)
  }

  const moveBlock = (blockId, delta) => {
    const index = blocks.findIndex((b) => b.id === blockId)
    const target = index + delta
    if (index < 0 || target < 0 || target >= blocks.length) return
    const next = [...blocks]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    commit(next)
  }

  // ---- drag and drop -------------------------------------------------------

  const dropAtRoot = (index) => {
    const payload = dragging.current
    dragging.current = null
    setDropTarget(null)
    if (!payload) return

    if (payload.kind === "new") {
      const block = createBlock(payload.type)
      const next = [...blocks]
      next.splice(index, 0, block)
      commit(next)
      setSelected({ blockId: block.id })
      setPanel("block")
      return
    }

    const from = blocks.findIndex((b) => b.id === payload.id)
    if (from < 0) return
    const next = [...blocks]
    const [moved] = next.splice(from, 1)
    // Removing it first shifts everything after up by one, so a drop below its
    // old position comes back down by one to land where the line was showing.
    next.splice(from < index ? index - 1 : index, 0, moved)
    commit(next)
  }

  const dropInColumn = (blockId, columnIndex) => {
    const payload = dragging.current
    dragging.current = null
    setDropTarget(null)
    if (!payload || payload.kind !== "new") return
    if (["columns", "footer", "social", "html", "video"].includes(payload.type)) return

    const child = createBlock(payload.type)
    commit(
      blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              columns: block.columns.map((column, index) =>
                index !== columnIndex ? column : { ...column, blocks: [...column.blocks, child] },
              ),
            },
      ),
    )
    setSelected({ blockId, columnIndex, childId: child.id })
    setPanel("block")
  }

  const html = useMemo(() => renderEmailHtml(blocks, settings), [blocks, settings])
  const innerWidth = settings.contentWidth - settings.padding * 2

  const isSelected = (blockId, childId) =>
    selected?.blockId === blockId && (selected?.childId ?? null) === (childId ?? null)

  const dropLineProps = (index) => ({
    index,
    active: dropTarget === `root-${index}`,
    onEnter: (i) => setDropTarget(`root-${i}`),
    onLeave: (i) => setDropTarget((cur) => (cur === `root-${i}` ? null : cur)),
    onDrop: dropAtRoot,
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
      {/* ---------------------------------------------------------- top bar */}
      <header className="flex items-center gap-3 bg-slate-800 px-4 py-2.5 text-white">
        <div className="min-w-0 flex-1">
          <input
            value={meta.name}
            onChange={(e) => onMetaChange({ name: e.target.value })}
            placeholder="No name"
            className="w-full max-w-sm bg-transparent text-lg font-semibold placeholder-white/40 focus:outline-none"
          />
          <p className={`text-xs ${dirty ? "text-amber-300" : "text-lime-300"}`}>
            {dirty ? "Not saved" : "Saved"}
            {/* Said here because the name at the top is the default's name, and
                without this the screen reads as though the default itself is
                being edited. */}
            {meta.fromDefault && (
              <span className="ml-2 text-white/50">Copy of a default — saving adds it to My Templates</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={past.current.length === 0}
            title="Undo (Cmd/Ctrl+Z)"
            className="rounded-md p-2 text-white/80 hover:bg-white/10 disabled:opacity-30"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.current.length === 0}
            title="Redo (Cmd/Ctrl+Shift+Z)"
            className="rounded-md p-2 text-white/80 hover:bg-white/10 disabled:opacity-30"
          >
            <Redo2 size={16} />
          </button>
          <span className="mx-1 h-5 w-px bg-white/20" />
          {[
            { id: "desktop", Icon: Monitor },
            { id: "mobile", Icon: Smartphone },
          ].map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-label={`${id} view`}
              className={`rounded-md p-2 ${device === id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"}`}
            >
              <Icon size={16} />
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            className="rounded-md border border-white/25 px-4 py-1.5 text-sm font-medium hover:bg-white/10"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-lime-500 px-5 py-1.5 text-sm font-semibold text-white hover:bg-lime-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 text-white/80 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ------------------------------------------------------ left rail */}
        <aside className="w-24 shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-2">
          {BLOCK_LIBRARY.map(({ type, label, icon, hint }) => {
            const Icon = ICONS[icon]
            return (
              <button
                key={type}
                type="button"
                draggable
                title={hint}
                onDragStart={() => {
                  dragging.current = { kind: "new", type }
                }}
                onDragEnd={() => {
                  dragging.current = null
                  setDropTarget(null)
                }}
                onClick={() => {
                  const block = createBlock(type)
                  commit([...blocks, block])
                  setSelected({ blockId: block.id })
                  setPanel("block")
                }}
                className="group flex w-full cursor-grab flex-col items-center gap-1 px-1 py-3 hover:bg-lime-50 active:cursor-grabbing"
              >
                <span className="rounded-lg border border-gray-200 bg-white p-2 group-hover:border-lime-400">
                  {Icon && <Icon size={18} className="text-gray-500 group-hover:text-lime-600" />}
                </span>
                <span className="text-[11px] font-medium leading-tight text-gray-600 group-hover:text-lime-700">
                  {label}
                </span>
              </button>
            )
          })}
        </aside>

        {/* --------------------------------------------------------- canvas */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6" style={{ background: "#e9ecef" }}>
          {settings.preheader && (
            <p className="mb-3 text-center text-xs text-gray-500">{settings.preheader}</p>
          )}

          <div
            className="mx-auto shadow-sm"
            style={{
              maxWidth: device === "mobile" ? 380 : settings.contentWidth,
              background: settings.contentBackground,
              borderRadius: settings.radius,
            }}
          >
            <DropLine {...dropLineProps(0)} />

            {blocks.length === 0 && (
              <div className="px-6 py-24 text-center">
                <LayoutGrid size={34} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">Your email is empty</p>
                <p className="mt-1 text-xs text-gray-400">Drag a block in from the left, or click one to add it.</p>
              </div>
            )}

            {blocks.map((block, index) => (
              <div key={block.id}>
                <div
                  onClick={() => {
                    select({ blockId: block.id })
                    setPanel("block")
                  }}
                  onMouseEnter={() => setHovered(block.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative cursor-pointer outline-offset-[-2px] ${
                    isSelected(block.id)
                      ? "outline outline-2 outline-lime-500"
                      : hovered === block.id
                        ? "outline outline-1 outline-lime-400"
                        : ""
                  }`}
                  style={{
                    background: block.background || "transparent",
                    padding:
                      `${block.paddingTop}px ${settings.padding + (block.paddingRight || 0)}px ` +
                      `${block.paddingBottom}px ${settings.padding + (block.paddingLeft || 0)}px`,
                  }}
                >
                  {block.type === "columns" ? (
                    <div
                      className="flex"
                      style={{
                        gap: block.gap,
                        alignItems:
                          block.verticalAlign === "middle" ? "center" : block.verticalAlign === "bottom" ? "flex-end" : "flex-start",
                      }}
                    >
                      {(block.columns || []).slice(0, block.count).map((column, columnIndex) => (
                        <div
                          key={column.id}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDropTarget(`col-${block.id}-${columnIndex}`)
                          }}
                          onDragLeave={() => setDropTarget((cur) => (cur === `col-${block.id}-${columnIndex}` ? null : cur))}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            dropInColumn(block.id, columnIndex)
                          }}
                          className={`min-w-0 flex-1 rounded ${
                            dropTarget === `col-${block.id}-${columnIndex}`
                              ? "outline-dashed outline-2 outline-lime-500"
                              : column.blocks.length === 0
                                ? "outline-dashed outline-1 outline-gray-300"
                                : ""
                          }`}
                        >
                          {column.blocks.length === 0 ? (
                            <p className="py-8 text-center text-[11px] text-gray-400">Drop a block here</p>
                          ) : (
                            column.blocks.map((child) => (
                              <div
                                key={child.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  select({ blockId: block.id, columnIndex, childId: child.id })
                                  setPanel("block")
                                }}
                                className={`relative cursor-pointer rounded outline-offset-[-2px] ${
                                  isSelected(block.id, child.id)
                                    ? "outline outline-2 outline-lime-500"
                                    : "hover:outline hover:outline-1 hover:outline-lime-300"
                                }`}
                                style={{
                                  padding:
                                    `${child.paddingTop}px ${child.paddingRight || 0}px ` +
                                    `${child.paddingBottom}px ${child.paddingLeft || 0}px`,
                                  background: child.background || "transparent",
                                }}
                              >
                                <BlockBody
                                  block={child}
                                  settings={settings}
                                  width={Math.floor((innerWidth - block.gap * (block.count - 1)) / block.count)}
                                  editing={isSelected(block.id, child.id)}
                                  onPatch={(patch) => patchBlock(block.id, columnIndex, child.id, patch)}
                                />
                                {isSelected(block.id, child.id) && (
                                  <button
                                    type="button"
                                    title="Remove"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeBlock(block.id, columnIndex, child.id)
                                    }}
                                    className="absolute -right-1 -top-1 rounded bg-white p-1 text-gray-400 shadow hover:text-red-600"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <BlockBody
                      block={block}
                      settings={settings}
                      width={innerWidth}
                      editing={isSelected(block.id)}
                      onPatch={(patch) => patchBlock(block.id, null, null, patch)}
                    />
                  )}

                  {(hovered === block.id || isSelected(block.id)) && (
                    <>
                      <span className="pointer-events-none absolute -top-2.5 left-2 z-20 rounded bg-lime-600 px-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {block.type}
                      </span>
                      <FloatingActions
                        canMoveUp={index > 0}
                        canMoveDown={index < blocks.length - 1}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, -1)}
                        onMoveDown={() => moveBlock(block.id, 1)}
                        onDelete={() => removeBlock(block.id)}
                        onDragStart={() => {
                          dragging.current = { kind: "move", id: block.id }
                        }}
                        onDragEnd={() => {
                          dragging.current = null
                          setDropTarget(null)
                        }}
                      />
                    </>
                  )}
                </div>

                <DropLine {...dropLineProps(index + 1)} />
              </div>
            ))}
          </div>
        </main>

        {/* --------------------------------------------------- right panel */}
        <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
          {/* Breadcrumb: the whole email, or the block inside it. */}
          <div className="flex items-center gap-1 border-b border-gray-200 px-3 py-2.5 text-sm">
            <button
              type="button"
              onClick={() => setPanel("email")}
              className={`flex items-center gap-1.5 rounded px-2 py-1 font-semibold ${
                panel === "email" ? "bg-lime-50 text-lime-700" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LayoutGrid size={14} />
              Email body
            </button>
            {activeBlock && (
              <>
                <span className="text-gray-300">›</span>
                <button
                  type="button"
                  onClick={() => setPanel("block")}
                  className={`flex items-center gap-1.5 rounded px-2 py-1 font-semibold capitalize ${
                    panel === "block" ? "bg-lime-50 text-lime-700" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {activeBlock.type}
                </button>
              </>
            )}
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto p-3">
            {panel === "block" && activeBlock ? (
              <BlockSettings block={activeBlock} onChange={updateSelected} />
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">The email</p>
                <Field title="Preheader" hint="The line shown after the subject in the inbox. Left empty, clients grab whatever words come first.">
                  <input
                    value={settings.preheader}
                    onChange={(e) => commit(blocks, { ...settings, preheader: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field title="Type">
                  <select
                    value={meta.type}
                    onChange={(e) => onMetaChange({ type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="order">Order</option>
                    <option value="verification">Verification</option>
                    <option value="custom">Custom</option>
                  </select>
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={meta.isDefault}
                    onChange={(e) => onMetaChange({ isDefault: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  Use as the default for this type
                </label>

                <div className="space-y-3.5 border-t border-gray-200 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Appearance</p>
                  <ColorField
                    title="Page background"
                    value={settings.backgroundColor}
                    onChange={(backgroundColor) => commit(blocks, { ...settings, backgroundColor })}
                  />
                  <ColorField
                    title="Content background"
                    value={settings.contentBackground}
                    onChange={(contentBackground) => commit(blocks, { ...settings, contentBackground })}
                  />
                  <ColorField
                    title="Link colour"
                    value={settings.linkColor}
                    onChange={(linkColor) => commit(blocks, { ...settings, linkColor })}
                  />
                  <NumberField
                    title="Content width"
                    value={settings.contentWidth}
                    min={320}
                    max={800}
                    onChange={(contentWidth) => commit(blocks, { ...settings, contentWidth })}
                  />
                  <NumberField
                    title="Side padding"
                    value={settings.padding}
                    min={0}
                    max={48}
                    onChange={(padding) => commit(blocks, { ...settings, padding })}
                  />
                  <NumberField
                    title="Corner radius"
                    value={settings.radius}
                    min={0}
                    max={24}
                    onChange={(radius) => commit(blocks, { ...settings, radius })}
                  />
                  <Field title="Font" hint="Only fonts already on the reader's machine will show.">
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => commit(blocks, { ...settings, fontFamily: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Arial, Helvetica, sans-serif">Arial</option>
                      <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Georgia, 'Times New Roman', serif">Georgia</option>
                      <option value="'Trebuchet MS', Tahoma, sans-serif">Trebuchet</option>
                      <option value="Verdana, Geneva, sans-serif">Verdana</option>
                      <option value="'Courier New', Courier, monospace">Courier</option>
                    </select>
                  </Field>
                  <button
                    type="button"
                    onClick={() => commit(blocks, { ...DEFAULT_SETTINGS, preheader: settings.preheader })}
                    className="w-full rounded-md border border-gray-300 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Reset appearance
                  </button>
                </div>
              </>
            )}
          </div>

          {extraActions && <div className="border-t border-gray-200 p-3">{extraActions}</div>}
        </aside>
      </div>

      {/* ------------------------------------------------------- preview */}
      {previewing && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/90 p-6">
          <div className="mb-3 flex items-center justify-between text-white">
            <p className="text-sm font-semibold">
              Preview — this is the document a mail client receives
            </p>
            <button onClick={() => setPreviewing(false)} className="rounded-md p-1.5 hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
          <iframe
            title="Email preview"
            srcDoc={html}
            sandbox=""
            className="mx-auto w-full flex-1 rounded-lg border-0 bg-white"
            style={{ maxWidth: device === "mobile" ? 390 : 760 }}
          />
        </div>
      )}
    </div>
  )
}

export default EmailBuilder
