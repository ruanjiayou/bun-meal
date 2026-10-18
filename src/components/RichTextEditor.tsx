import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Heading2, List, ListOrdered, Quote, Eraser, Undo2, Redo2,
} from 'lucide-react'
import { EditorWrap, Toolbar, ToolButton, ToolDivider, Editable } from '../styles/RichTextEditor'

type Props = {
  /** 初始 HTML，组件内部非受控，仅在挂载时生效（父组件用 key 重建） */
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
}

const exec = (command: string, value?: string) => {
  try {
    document.execCommand('styleWithCSS', false, 'false')
  } catch (e) { }
  document.execCommand(command, false, value)
}

const RichTextEditor = ({ defaultValue = '', placeholder = '写点什么… 支持加粗、列表、小标题', onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [hasContent, setHasContent] = useState(!!defaultValue)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || ''
      setHasContent(!!defaultValue)
    }
  }, [])

  const syncState = () => {
    const state: Record<string, boolean> = {}
    ;['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].forEach(cmd => {
      try {
        state[cmd] = document.queryCommandState(cmd)
      } catch (e) {
        state[cmd] = false
      }
    })
    setActive(state)
  }

  const emit = () => {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    // 只剩一个换行时视为空
    const empty = !el.textContent?.trim() && !el.querySelector('img')
    const value = empty ? '' : html
    setHasContent(!empty)
    onChange?.(value)
  }

  const run = (command: string, value?: string) => {
    editorRef.current?.focus()
    exec(command, value)
    emit()
    syncState()
  }

  const block = (tag: string) => {
    editorRef.current?.focus()
    exec('formatBlock', tag)
    emit()
    syncState()
  }

  const preventBlur = (e: { preventDefault: () => void }) => e.preventDefault()

  return (
    <EditorWrap>
      <Toolbar>
        <ToolButton
          type="button"
          title="加粗"
          className={active.bold ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('bold')}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          type="button"
          title="斜体"
          className={active.italic ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('italic')}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          type="button"
          title="下划线"
          className={active.underline ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('underline')}
        >
          <Underline />
        </ToolButton>
        <ToolButton
          type="button"
          title="删除线"
          className={active.strikeThrough ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('strikeThrough')}
        >
          <Strikethrough />
        </ToolButton>

        <ToolDivider />

        <ToolButton
          type="button"
          title="小标题"
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => block('h3')}
        >
          <Heading2 />
        </ToolButton>
        <ToolButton
          type="button"
          title="正文"
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => block('p')}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>A</span>
        </ToolButton>

        <ToolDivider />

        <ToolButton
          type="button"
          title="无序列表"
          className={active.insertUnorderedList ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('insertUnorderedList')}
        >
          <List />
        </ToolButton>
        <ToolButton
          type="button"
          title="有序列表"
          className={active.insertOrderedList ? 'active' : ''}
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('insertOrderedList')}
        >
          <ListOrdered />
        </ToolButton>
        <ToolButton
          type="button"
          title="引用"
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => block('blockquote')}
        >
          <Quote />
        </ToolButton>

        <ToolDivider />

        <ToolButton
          type="button"
          title="撤销"
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => run('undo')}
        >
          <Undo2 />
        </ToolButton>
        <ToolButton
          type="button"
          title="清除格式"
          onMouseDown={preventBlur}
          onTouchStart={preventBlur}
          onClick={() => {
            editorRef.current?.focus()
            exec('removeFormat')
            exec('formatBlock', 'p')
            emit()
            syncState()
          }}
        >
          <Eraser />
        </ToolButton>
      </Toolbar>

      <Editable
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={hasContent ? '' : placeholder}
        onInput={emit}
        onKeyUp={syncState}
        onMouseUp={syncState}
        onBlur={syncState}
        onPaste={(e) => {
          // 只接受纯文本，避免外部样式污染
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          exec('insertText', text)
          emit()
        }}
      />
    </EditorWrap>
  )
}

export default RichTextEditor
