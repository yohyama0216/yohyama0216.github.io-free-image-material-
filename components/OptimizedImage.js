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
  // WebP画像のパスを生成
  const getWebPPath = (originalPath) => {
    if (!originalPath) return originalPath;
    
    const lastDotIndex = originalPath.lastIndexOf('.');
    if (lastDotIndex === -1) return originalPath;
    
    return originalPath.substring(0, lastDotIndex) + '.webp';
  };

  const webpSrc = getWebPPath(src);

  return (
    <picture>
      {/* WebP対応ブラウザ用 */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* フォールバック用 */}
      <img
        src={src}
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
