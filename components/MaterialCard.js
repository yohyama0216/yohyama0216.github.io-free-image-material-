import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

const MaterialCard = ({ material }) => {
  // GitHub Pages の basePath
  const basePath = '/yohyama0216.github.io-free-image-material-';

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

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = normalizePath(url);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        <Link href={`/materials/${material.id}`} className="text-decoration-none">
          <OptimizedImage 
            src={material.thumbnailUrl} 
            className="card-img-top" 
            alt={material.title}
            style={{ height: '200px', objectFit: 'cover' }}
            loading="lazy"
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
            <Link href={`/materials/${material.id}`} className="text-decoration-none text-dark">
              {material.title}
            </Link>
          </h5>
          <p className="card-text text-muted flex-grow-1">{material.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{material.category}</small>
            <div className="btn-group">
              <Link 
                href={`/materials/${material.id}`}
                className="btn btn-outline-primary btn-sm text-decoration-none"
              >
                <i className="fas fa-eye me-1"></i>
                詳細
              </Link>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => downloadImage(material.downloadUrl, material.filename)}
              >
                <i className="fas fa-download me-1"></i>
                DL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
