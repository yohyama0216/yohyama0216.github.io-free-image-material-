import React from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  width, 
  height, 
  loading = 'lazy',
  priority = false 
}) => {
  // GitHub Pages の basePath
  const basePath = '/yohyama0216.github.io-free-image-material-';

  // WebP画像のパスを生成
  const getWebPPath = (originalPath) => {
    if (!originalPath) return originalPath;
    
    const lastDotIndex = originalPath.lastIndexOf('.');
    if (lastDotIndex === -1) return originalPath;
    
    return originalPath.substring(0, lastDotIndex) + '.webp';
  };

  // パスを正規化する関数
  const normalizePath = (path) => {
    if (!path) return path;
    
    // ./で始まる相対パスの場合
    if (path.startsWith('./')) {
      return basePath + '/' + path.substring(2);
    }
    
    // /で始まる絶対パスの場合
    if (path.startsWith('/') && !path.startsWith(basePath)) {
      return basePath + path;
    }
    
    // basePathが既に含まれている場合
    if (path.startsWith(basePath)) {
      return path;
    }
    
    // その他の場合
    return basePath + '/' + path;
  };

  const normalizedSrc = normalizePath(src);
  const webpSrc = getWebPPath(normalizedSrc);

  return (
    <picture>
      {/* WebP対応ブラウザ用 */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* フォールバック用 */}
      <img
        src={normalizedSrc}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        loading={loading}
        {...(priority && { fetchPriority: 'high' })}
      />
    </picture>
  );
};

export default OptimizedImage;
