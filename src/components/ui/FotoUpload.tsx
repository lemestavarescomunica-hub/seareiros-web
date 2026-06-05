'use client';
import { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';

interface FotoUploadProps {
  fotoAtual?: string | null;
  userId: string;
  onFotoAtualizada: (url: string) => void;
  tamanho?: number;
}

export function FotoUpload({ fotoAtual, userId, onFotoAtualizada, tamanho = 96 }: FotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(fotoAtual || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('/api/upload-foto', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) onFotoAtualizada(data.fotoUrl);
    } catch {
      // keep preview even if upload fails
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        style={{ width: tamanho, height: tamanho }}
      >
        {preview ? (
          <img src={preview} alt="Foto" className="w-full h-full rounded-full object-cover" style={{ border: '3px solid #E8DDD5' }} />
        ) : (
          <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center" style={{ border: '3px solid #E8DDD5' }}>
            <User size={tamanho * 0.4} className="text-[#D4764E]" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={24} className="text-white" />
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <span className="text-xs text-[#7A6B6B]">{uploading ? 'Enviando...' : 'Toque para adicionar foto'}</span>
    </div>
  );
}
