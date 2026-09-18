/**
 * 上传图片自动压缩：
 * - 尺寸超过 1600px 时缩放到 1600px 内；
 * - 大文件 JPEG/WebP 重编码到 quality 0.82；
 * - 大尺寸 PNG（摄影图，无透明需求）自动转为 JPEG（白底），体积可降 90%+；
 * - 小图片（图标/Logo）保持原样，避免质量损失。
 */

const MAX_EDGE = 1600;
/** 超过该大小才考虑重编码 */
const SIZE_THRESHOLD = 300 * 1024;
/** PNG 摄影图判定：尺寸足够大且文件不小 */
const BIG_PNG_MIN_EDGE = 900;
const BIG_PNG_MIN_SIZE = 400 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片解析失败'));
    img.src = src;
  });
}

export async function compressImageFile(file: File): Promise<File> {
  // 只处理常见位图格式；非图片或小文件直接原样返回
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size < SIZE_THRESHOLD) {
    return file;
  }

  const mime = file.type.toLowerCase();
  const isPng = mime === 'image/png';
  // 大 PNG 摄影图（尺寸大且文件大）转 JPEG 白底
  const bigPng = isPng && file.size >= BIG_PNG_MIN_SIZE;

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(dataUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const needResize = scale < 1;
    const isBigPhoto = bigPng && w >= BIG_PNG_MIN_EDGE && h >= BIG_PNG_MIN_EDGE;
    // 不需要缩放、也不是大摄影 PNG、文件 < 500KB → 直接返回
    if (!needResize && !isBigPhoto && file.size < 500 * 1024) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    if (isBigPhoto) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const outMime = isBigPhoto ? 'image/jpeg' : mime;
    const quality = outMime === 'image/jpeg' ? (isBigPhoto ? 0.85 : 0.82) : undefined;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('压缩失败'))),
        outMime,
        quality,
      );
    });

    const ext = outMime === 'image/jpeg' ? 'jpg' : outMime === 'image/png' ? 'png' : 'webp';
    const base = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${base}.${ext}`, { type: outMime });
  } catch {
    // 压缩失败不影响上传，返回原文件
    return file;
  }
}
