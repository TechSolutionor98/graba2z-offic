import { Mark, mergeAttributes } from "@tiptap/core"
import TextStyle from "@tiptap/extension-text-style"

/**
 * The marks the email toolbar needs that TipTap does not ship on its own.
 *
 * Colour, size, font and highlight all ride on TextStyle's <span>, so they
 * combine on the same run of text instead of nesting four spans deep. Sub and
 * sup are tiny marks of their own, because there is no package for them in this
 * project and writing one is shorter than adding a dependency.
 *
 * Everything here renders as an inline style or a plain tag -- which is exactly
 * what survives the email sanitizer, and exactly what mail clients honour.
 */

export const EmailTextStyle = TextStyle.extend({
  addAttributes() {
    const styled = (name, cssProperty) => ({
      default: null,
      parseHTML: (element) => element.style[cssProperty] || null,
      renderHTML: (attributes) =>
        attributes[name] ? { style: `${cssProperty.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${attributes[name]}` } : {},
    })

    return {
      color: styled("color", "color"),
      backgroundColor: styled("backgroundColor", "backgroundColor"),
      fontSize: styled("fontSize", "fontSize"),
      fontFamily: styled("fontFamily", "fontFamily"),
    }
  },

  addCommands() {
    // One command per attribute. Each merges into whatever TextStyle already
    // holds, so setting a colour does not wipe a font size set a moment ago.
    const setter = (name) => (value) => ({ chain }) =>
      value === null
        ? chain().setMark("textStyle", { [name]: null }).removeEmptyTextStyle().run()
        : chain().setMark("textStyle", { [name]: value }).run()

    return {
      setTextColor: setter("color"),
      setHighlight: setter("backgroundColor"),
      setFontSize: setter("fontSize"),
      setFontFamily: setter("fontFamily"),
    }
  },
})

/** A mark that is nothing but a tag -- no attributes, no styling of its own. */
const plainMark = (name, tag) =>
  Mark.create({
    name,
    parseHTML: () => [{ tag }],
    renderHTML: ({ HTMLAttributes }) => [tag, mergeAttributes(HTMLAttributes), 0],
    addCommands() {
      return {
        [`toggle${name[0].toUpperCase()}${name.slice(1)}`]: () => ({ commands }) => commands.toggleMark(name),
      }
    },
  })

export const Superscript = plainMark("superscript", "sup")
export const Subscript = plainMark("subscript", "sub")
