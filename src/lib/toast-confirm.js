export function confirmAction(message, onConfirm) {
  import('react-hot-toast').then(({ toast }) => {
    toast((t) => (
      <div>
        <div style={{ fontWeight: '500', marginBottom: '12px', color: '#1e293b' }}>{message}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}
          >
            Batal
          </button>
          <button 
            onClick={() => { toast.dismiss(t.id); onConfirm(); }} 
            style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'white' }}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity, 
      style: { background: '#ffffff', color: '#1e293b', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }
    });
  });
}
