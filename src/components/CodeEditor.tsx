import { onMount, onCleanup, createEffect } from 'solid-js';
import * as monaco from 'monaco-editor';
import { webcontainer } from '~/lib/webcontainer';
import './CodeEditor.css';

// 配置 Monaco Editor Workers
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    // 禁用 TypeScript/JavaScript workers 避免跨域问题
    return new Worker('', { type: 'module' });
  }
};

interface CodeEditorProps {
  filePath: string | null;
  onSave?: (path: string, content: string) => void;
}

export default function CodeEditor(props: CodeEditorProps) {
  let editorContainer: HTMLDivElement | undefined;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;

  onMount(() => {
    if (!editorContainer) return;

    // 禁用 TypeScript 语言特性，避免 worker 错误
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    // 初始化 Monaco Editor
    editor = monaco.editor.create(editorContainer, {
      value: '',
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      tabSize: 2,
    });

    // 保存快捷键 (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (props.filePath) {
        const content = editor!.getValue();
        handleSave(props.filePath, content);
      }
    });
  });

  // 监听文件路径变化，加载文件内容
  createEffect(async () => {
    if (!editor || !props.filePath) return;

    try {
      const content = await webcontainer.readFile(props.filePath);
      editor.setValue(content);

      // 根据文件扩展名设置语言
      const ext = props.filePath.split('.').pop();
      const languageMap: Record<string, string> = {
        ts: 'typescript',
        tsx: 'typescript',
        js: 'javascript',
        jsx: 'javascript',
        json: 'json',
        css: 'css',
        html: 'html',
        md: 'markdown',
        py: 'python',
      };
      const language = languageMap[ext || ''] || 'plaintext';
      monaco.editor.setModelLanguage(editor.getModel()!, language);
    } catch (error) {
      console.error('Failed to load file:', error);
      editor.setValue('// 文件加载失败');
    }
  });

  const handleSave = async (path: string, content: string) => {
    try {
      await webcontainer.writeFile(path, content);
      webcontainer.notifyFileChange(path);
      props.onSave?.(path, content);

      // 显示保存提示
      const messageContribution = editor!.getContribution('editor.contrib.messageController');
      (messageContribution as any).showMessage('文件已保存', editor!.getPosition());
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  onCleanup(() => {
    editor?.dispose();
  });

  return (
    <div class="code-editor">
      <div class="editor-header">
        <span class="file-path">{props.filePath || '未选择文件'}</span>
        <span class="editor-hint">Ctrl+S 保存</span>
      </div>
      <div ref={editorContainer} class="editor-container" />
    </div>
  );
}
