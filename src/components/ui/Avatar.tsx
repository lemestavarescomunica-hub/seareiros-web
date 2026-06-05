import { iniciais } from '@/lib/utils';

const CORES = ['#D4764E','#5B8C5A','#E8C547','#7B68EE','#20B2AA','#CD853F','#708090','#BC8F8F','#9ACD32','#4682B4'];

function corPorNome(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return CORES[Math.abs(hash) % CORES.length];
}

export function Avatar({ nome, size = 40, fotoUrl }: { nome: string; size?: number; fotoUrl?: string | null }) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, border: '2px solid #E8DDD5' }}
      />
    );
  }
  const cor = corPorNome(nome);
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: cor + '25', border: `2px solid ${cor}50`, color: cor, fontSize: size * 0.38 }}
    >
      {iniciais(nome)}
    </div>
  );
}
