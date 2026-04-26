export default function Spinner({ size = 'md', center = false }) {
  const cls = ['spinner', size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''].join(' ').trim();
  if (center) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 0' }}>
        <div className={cls} />
      </div>
    );
  }
  return <div className={cls} />;
}
