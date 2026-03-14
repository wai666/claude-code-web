import Terminal from '~/components/Terminal';

// 禁用此页面的 SSR
export const ssr = false;

export default function Home() {
  return <Terminal />;
}
