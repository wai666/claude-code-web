import { For, createSignal, Show, createEffect } from 'solid-js';
import { webcontainer } from '~/lib/webcontainer';
import { ContextManager } from '~/lib/context-manager';
import './MentionInput.css';

interface MentionInputProps {
  onSubmit: (value: string, context: string) => void;
  disabled?: boolean;
}

export default function MentionInput(props: MentionInputProps) {
  const [value, setValue] = createSignal('');
  const [showSuggestions, setShowSuggestions] = createSignal(false);
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [mentionedFiles, setMentionedFiles] = createSignal<string[]>([]);
  const [cursorPosition, setCursorPosition] = createSignal(0);

  let inputRef: HTMLInputElement | undefined;
  const contextManager = new ContextManager();

  // 检测 @ 触发
  createEffect(() => {
    const val = value();
    const pos = cursorPosition();

    if (!val) {
      setShowSuggestions(false);
      return;
    }

    // 查找最近的 @
    const beforeCursor = val.slice(0, pos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = beforeCursor.slice(lastAtIndex + 1);

      // 如果 @ 后面有空格，关闭建议
      if (query.includes(' ')) {
        setShowSuggestions(false);
        return;
      }

      // 搜索文件
      searchFiles(query);
    } else {
      setShowSuggestions(false);
    }
  });

  const searchFiles = async (query: string) => {
    try {
      // 简化版：只搜索根目录
      const files = await webcontainer.readdir('/');
      const filtered = files.filter(f =>
        f.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to search files:', error);
    }
  };

  const insertMention = (file: string) => {
    const val = value();
    const pos = cursorPosition();
    const beforeCursor = val.slice(0, pos);
    const afterCursor = val.slice(pos);

    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const newValue =
      beforeCursor.slice(0, lastAtIndex) +
      `@${file} ` +
      afterCursor;

    setValue(newValue);
    setMentionedFiles(prev => [...prev, file]);
    setShowSuggestions(false);

    // 恢复焦点
    setTimeout(() => inputRef?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showSuggestions()) return;

    const sug = suggestions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % sug.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + sug.length) % sug.length);
        break;
      case 'Enter':
        if (sug.length > 0) {
          e.preventDefault();
          insertMention(sug[selectedIndex()]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    console.log('=== MentionInput handleFormSubmit ===');
    console.log('Event:', e);

    const val = value();
    console.log('value():', val);
    console.log('value() type:', typeof val);

    if (!val.trim()) {
      console.log('Empty value, returning');
      return;
    }

    // 构建上下文
    contextManager.clear();
    for (const file of mentionedFiles()) {
      try {
        const content = await webcontainer.readFile(`/${file}`);
        contextManager.addFile(file, content);
      } catch (error) {
        console.error(`Failed to load ${file}:`, error);
      }
    }

    const context = contextManager.getContext();
    console.log('Calling props.onSubmit with:', { val, context });
    props.onSubmit(val, context);

    // 清空
    setValue('');
    setMentionedFiles([]);
  };

  return (
    <div class="mention-input-wrapper">
      <Show when={mentionedFiles().length > 0}>
        <div class="mentioned-files">
          <For each={mentionedFiles()}>
            {(file) => (
              <span class="file-tag">
                📄 {file}
                <button
                  class="remove-tag"
                  onClick={() => setMentionedFiles(prev => prev.filter(f => f !== file))}
                >
                  ×
                </button>
              </span>
            )}
          </For>
        </div>
      </Show>

      <form class="mention-input-form" onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
          onClick={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
          placeholder="输入消息... (@ 引用文件)"
          disabled={props.disabled}
        />
        <button type="submit" disabled={props.disabled || !value().trim()}>
          发送
        </button>
      </form>

      <Show when={showSuggestions()}>
        <div class="mention-suggestions">
          <For each={suggestions()}>
            {(file, index) => (
              <div
                class={`suggestion-item ${index() === selectedIndex() ? 'selected' : ''}`}
                onClick={() => insertMention(file)}
              >
                📄 {file}
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
