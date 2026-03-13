import { createSignal } from 'solid-js';

interface SimpleInputProps {
  onSubmit: (text: string) => void;
}

export default function SimpleInput(props: SimpleInputProps) {
  const [value, setValue] = createSignal('');

  console.log('SimpleInput component mounted');

  const handleSubmit = (e: Event) => {
    console.log('=== FORM SUBMIT EVENT ===');
    console.log('Event:', e);
    console.log('Event type:', e.type);

    e.preventDefault();

    console.log('SimpleInput handleSubmit called');
    console.log('value:', value());

    const val = value();
    if (val.trim()) {
      console.log('Calling props.onSubmit with:', val);
      props.onSubmit(val);
      setValue('');
    } else {
      console.log('Value is empty, not submitting');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '10px',
        padding: '20px',
        position: 'relative',
        'z-index': '9999',
        background: '#000'
      }}
    >
      <input
        type="text"
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        placeholder="输入测试消息..."
        style={{
          flex: 1,
          padding: '10px',
          background: '#222',
          color: '#0f0',
          border: '1px solid #0f0',
          'z-index': '10000'
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 20px',
          background: '#0f0',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          'z-index': '10000'
        }}
      >
        发送
      </button>
    </form>
  );
}
