import { For, createSignal, createEffect, Show } from 'solid-js';
import { webcontainer } from '~/lib/webcontainer';
import './FileTree.css';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
}

export default function FileTree(props: FileTreeProps) {
  const [tree, setTree] = createSignal<FileNode[]>([]);
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null);

  // 加载文件树
  const loadTree = async (path: string = '/'): Promise<FileNode[]> => {
    try {
      const entries = await webcontainer.readdir(path);
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        const fullPath = path === '/' ? `/${entry}` : `${path}/${entry}`;

        // 简单判断是否为目录（实际需要 stat）
        const isDir = !entry.includes('.');

        nodes.push({
          name: entry,
          path: fullPath,
          type: isDir ? 'directory' : 'file',
          children: isDir ? [] : undefined,
        });
      }

      return nodes;
    } catch (error) {
      console.error('Failed to load tree:', error);
      return [];
    }
  };

  // 初始化
  createEffect(async () => {
    const root = await loadTree('/');
    setTree(root);
  });

  // 切换展开/折叠
  const toggleExpand = async (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFile(node.path);
      props.onFileSelect(node.path);
      return;
    }

    const exp = new Set(expanded());

    if (exp.has(node.path)) {
      exp.delete(node.path);
    } else {
      exp.add(node.path);
      // 加载子节点
      if (node.children?.length === 0) {
        const children = await loadTree(node.path);
        setTree(prev => updateNodeChildren(prev, node.path, children));
      }
    }

    setExpanded(exp);
  };

  // 更新节点子元素
  const updateNodeChildren = (
    nodes: FileNode[],
    path: string,
    children: FileNode[]
  ): FileNode[] => {
    return nodes.map(node => {
      if (node.path === path) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, path, children) };
      }
      return node;
    });
  };

  // 渲染节点
  const renderNode = (node: FileNode, depth: number = 0) => (
    <div class="file-node" style={{ 'padding-left': `${depth * 16}px` }}>
      <div
        class={`node-content ${selectedFile() === node.path ? 'selected' : ''}`}
        onClick={() => toggleExpand(node)}
      >
        <span class="node-icon">
          {node.type === 'directory'
            ? (expanded().has(node.path) ? '📂' : '📁')
            : '📄'}
        </span>
        <span class="node-name">{node.name}</span>
      </div>
      <Show when={node.type === 'directory' && expanded().has(node.path)}>
        <For each={node.children}>
          {(child) => renderNode(child, depth + 1)}
        </For>
      </Show>
    </div>
  );

  return (
    <div class="file-tree">
      <div class="file-tree-header">
        <span>文件浏览器</span>
      </div>
      <div class="file-tree-body">
        <For each={tree()}>
          {(node) => renderNode(node)}
        </For>
      </div>
    </div>
  );
}
