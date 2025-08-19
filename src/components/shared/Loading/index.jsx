export function LoadingOverlay({ text = 'Cargando...' }) {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin'></div>

        <p className='text-white text-lg font-medium'>{text}</p>
      </div>
    </div>
  );
}
