import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Comprime uma imagem localmente via Canvas para economizar espaço e carregar instantaneamente.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converte dataUrl base64 em Blob para upload no Supabase Storage.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Faz upload da imagem:
 * 1. Comprime a imagem no navegador.
 * 2. Tenta fazer upload para o bucket 'ls_images' no Supabase Storage.
 * 3. Se o bucket não estiver criado ou falhar, retorna o dataUrl comprimido (funciona 100% direto no banco).
 */
export async function uploadImageFile(file: File, folder = 'uploads'): Promise<string> {
  // 1. Comprime imagem no cliente
  const compressedDataUrl = await compressImage(file);

  // 2. Se o Supabase estiver configurado, tenta salvar no bucket de Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const blob = dataUrlToBlob(compressedDataUrl);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('ls_images')
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('ls_images')
          .getPublicUrl(fileName);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else {
        console.warn('Storage bucket ls_images não disponível ou com erro, usando fallback base64:', error?.message);
      }
    } catch (err) {
      console.warn('Falha no upload do Supabase Storage, usando dataUrl comprimido:', err);
    }
  }

  // 3. Fallback garantido: retorna o dataUrl comprimido
  return compressedDataUrl;
}
