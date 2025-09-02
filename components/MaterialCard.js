import React from 'react';
import Link from 'next/link';

const MaterialCard = ({ material }) => {
  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        <Link href={`/materials/${material.id}`} className="text-decoration-none">
          <img 
            src={material.thumbnailUrl} 
            className="card-img-top" 
            alt={material.title}
            style={{ height: '200px', objectFit: 'cover' }}
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
              <a 
                href={`/materials/${material.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fas fa-eye me-1"></i>
                詳細
              </a>
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
