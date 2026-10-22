"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import "./email-editor.css"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code2,
  Eraser,
  Highlighter,
  Indent,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Outdent,
  Quote,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Underline as UnderlineIcon,
} from "lucide-react"

import { EmailTextStyle, Subscript, Superscript } from "./richTextExtensions"
import { MERGE_FIELDS } from "../../../utils/emailBlocks"

/**
 * The rich-text editor behind heading and text blocks.
 *
 * Everything it offers survives into the email: each control maps to a tag or an
 * inline style that the sanitizer keeps and that mail clients honour. Nothing is
 * offered that would be silently stripped on the way out -- a toolbar button
 * that does nothing to the sent email is worse than no button.
 */

const FONT_SIZES = [11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48]
const FONTS = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', Tahoma, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
]
const SWATCHES = [
  "#111827", "#374151", "#6b7280", "#9ca3af", "#ffffff",
  "#dc2626", "#ea580c", "#f59e0b", "#84cc16", "#16a34a",
  "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#be123c",
]

// The dark bar across the top of the constructor. The toolbar may not go under it.
const HEADER_HEIGHT = 64

const btn = (active) =>
  `rounded p-1.5 ${active ? "bg-lime-100 text-lime-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
const select =
  "rounded border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-700 focus:border-lime-500 focus:outline-none"

/** A dropdown of colour swatches, plus a free colour input. */
const ColorMenu = ({ Icon, title, onPick, onClear }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button type="button" title={title} onClick={() => setOpen((o) => !o)} className={btn(false)}>
        <Icon size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-40 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            <div className="grid grid-cols-5 gap-1">
              {SWATCHES.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  onClick={() => {
                    onPick(colour)
                    setOpen(false)
                  }}
                  style={{ background: colour }}
                  className="h-6 w-6 rounded border border-gray-200 hover:ring-2 hover:ring-lime-400"
                />
              ))}
            </div>
            <input
              type="color"
              onChange={(e) => onPick(e.target.value)}
              className="mt-2 h-7 w-full cursor-pointer rounded border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                onClear()
                setOpen(false)
              }}
              className="mt-1.5 w-full rounded border border-gray-200 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const Toolbar = ({ editor, floating = false }) => {
  const [linkOpen, setLinkOpen] = useState(false)
  const [href, setHref] = useState("")
  const [fieldsOpen, setFieldsOpen] = useState(false)

  if (!editor) return null

  const applyLink = () => {
    const url = href.trim()
    if (!url) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setLinkOpen(false)
    setHref("")
  }

  const currentBlock = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "p"

  const setBlock = (value) => {
    const chain = editor.chain().focus()
    if (value === "p") chain.setParagraph().run()
    else chain.toggleHeading({ level: Number(value.slice(1)) }).run()
  }

  const align = ["left", "center", "right", "justify"].find((a) => editor.isActive({ textAlign: a })) || "left"
  const ALIGN_ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }

  return (
    <div
      className={
        floating
          ? "w-[560px] max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-lg"
          : "w-full rounded-t-md border-b border-gray-200 bg-gray-50"
      }
    >
      {/* ---- first row: structure, size, the common marks ---- */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-1.5 py-1">
        <select value={currentBlock} onChange={(e) => setBlock(e.target.value)} className={`${select} w-24`}>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          value={editor.getAttributes("textStyle").fontSize || ""}
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value || null).run()}
          className={`${select} w-16`}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={`${size}px`}>
              {size}px
            </option>
          ))}
        </select>

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
          <Bold size={14} />
        </button>
        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
          <Italic size={14} />
        </button>
        <button type="button" title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}>
          <UnderlineIcon size={14} />
        </button>
        <button type="button" title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}>
          <Strikethrough size={14} />
        </button>

        <ColorMenu
          Icon={Baseline}
          title="Text colour"
          onPick={(colour) => editor.chain().focus().setTextColor(colour).run()}
          onClear={() => editor.chain().focus().setTextColor(null).run()}
        />
        <ColorMenu
          Icon={Highlighter}
          title="Highlight"
          onPick={(colour) => editor.chain().focus().setHighlight(colour).run()}
          onClear={() => editor.chain().focus().setHighlight(null).run()}
        />

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        {Object.entries(ALIGN_ICONS).map(([value, Icon]) => (
          <button
            key={value}
            type="button"
            title={`Align ${value}`}
            onClick={() => editor.chain().focus().setTextAlign(value).run()}
            className={btn(align === value)}
          >
            <Icon size={14} />
          </button>
        ))}

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        <button type="button" title="Add a link" onClick={() => { setHref(editor.getAttributes("link").href || ""); setLinkOpen((o) => !o) }} className={btn(editor.isActive("link"))}>
          <Link2 size={14} />
        </button>
        <button type="button" title="Remove the link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()} className={`${btn(false)} disabled:opacity-30`}>
          <Link2Off size={14} />
        </button>
      </div>

      {/* ---- second row: font, lists, the rest ---- */}
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1">
        <select
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value || null).run()}
          className={`${select} w-24`}
        >
          <option value="">Font</option>
          {FONTS.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        <button type="button" title="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
          <List size={14} />
        </button>
        <button type="button" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
          <ListOrdered size={14} />
        </button>
        <button type="button" title="Increase indent" onClick={() => editor.chain().focus().sinkListItem("listItem").run()} className={btn(false)}>
          <Indent size={14} />
        </button>
        <button type="button" title="Decrease indent" onClick={() => editor.chain().focus().liftListItem("listItem").run()} className={btn(false)}>
          <Outdent size={14} />
        </button>

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        <button type="button" title="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={btn(editor.isActive("superscript"))}>
          <SupIcon size={14} />
        </button>
        <button type="button" title="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} className={btn(editor.isActive("subscript"))}>
          <SubIcon size={14} />
        </button>
        <button type="button" title="Code" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))}>
          <Code2 size={14} />
        </button>
        <button type="button" title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
          <Quote size={14} />
        </button>
        <button
          type="button"
          title="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={btn(false)}
        >
          <Eraser size={14} />
        </button>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setFieldsOpen((o) => !o)}
            className="rounded px-2 py-1 text-[11px] font-semibold text-lime-700 hover:bg-lime-50"
          >
            + Field
          </button>
          {fieldsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFieldsOpen(false)} />
              <div className="absolute right-0 z-40 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {MERGE_FIELDS.map((f) => (
                  <button
                    key={f.token}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertContent(f.token).run()
                      setFieldsOpen(false)
                    }}
                    className="block w-full px-3 py-1.5 text-left text-xs hover:bg-lime-50"
                  >
                    <span className="block font-medium text-gray-800">{f.label}</span>
                    <span className="block font-mono text-[10px] text-gray-400">{f.token}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-1 border-t border-gray-100 px-1.5 py-1.5">
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyLink()
              }
            }}
            placeholder="https://…  (leave empty to remove the link)"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-lime-500 focus:outline-none"
          />
          <button type="button" onClick={applyLink} className="rounded bg-lime-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-lime-700">
            Apply
          </button>
        </div>
      )}
    </div>
  )
}

const EXTENSIONS = [
  StarterKit.configure({ horizontalRule: false, codeBlock: false }),
  Underline,
  EmailTextStyle,
  Superscript,
  Subscript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } }),
]

const RichTextEditor = ({ value, onChange, minHeight = 90, inline = false, style }) => {
  const wrapper = useRef(null)
  const toolbar = useRef(null)
  const [focused, setFocused] = useState(false)
  // Which side of the block the toolbar sits on, and how far it is nudged
  // sideways to stay on screen. Both are measured, not assumed: a block at the
  // top of the canvas has no room above it, and one near the right edge would
  // otherwise push the toolbar off the side.
  const [placement, setPlacement] = useState({ above: true, shift: 0 })

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value || "",
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    onFocus: () => setFocused(true),
    editorProps: {
      attributes: {
        class: inline ? "max-w-none focus:outline-none" : "prose-sm max-w-none px-2.5 py-2 text-sm focus:outline-none",
        style: inline ? "" : `min-height:${minHeight}px`,
      },
    },
  })

  // Follow changes made elsewhere -- undo, or a different block of the same
  // type. Guarded on the content actually differing, or every keystroke would
  // put the caret back at the start.
  useEffect(() => {
    if (!editor) return
    const incoming = value || ""
    if (incoming !== editor.getHTML()) editor.commands.setContent(incoming, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  // Work out where the toolbar fits, and keep it there while the canvas scrolls.
  useEffect(() => {
    if (!inline || !focused) return undefined

    const place = () => {
      const host = wrapper.current
      if (!host) return
      const box = host.getBoundingClientRect()
      const height = toolbar.current?.offsetHeight || 92
      const width = toolbar.current?.offsetWidth || 560

      // The app header sits at the top of the window; anything above it is out
      // of reach, so the toolbar goes below the block instead.
      const above = box.top - height - 10 > HEADER_HEIGHT

      // Keep it inside the window horizontally too.
      const overflowRight = box.left + width + 12 - window.innerWidth
      const shift = overflowRight > 0 ? -overflowRight : Math.min(0, -(box.left - 12))

      setPlacement({ above, shift })
    }

    place()
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
    }
  }, [inline, focused])

  if (inline) {
    return (
      <div className="relative" ref={wrapper}>
        {/* The toolbar floats clear of the text so it never covers the line
            being typed, and picks the side with room for it. It appears once the
            caret is in, not on hover, so a page of blocks is not a page of
            toolbars. */}
        {focused && (
          <div
            ref={toolbar}
            className="absolute z-40"
            style={{
              [placement.above ? "bottom" : "top"]: "calc(100% + 10px)",
              left: placement.shift,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Toolbar editor={editor} floating />
          </div>
        )}
        <div className="email-inline-editor" style={style}>
          <EditorContent
            editor={editor}
            className="[&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 focus-within:border-lime-500 focus-within:ring-1 focus-within:ring-lime-500">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="[&_a]:text-lime-700 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  )
}

export default RichTextEditor
