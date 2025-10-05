
import React, { useState } from 'react';
import axios from 'axios';

function BatchUpload() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
const cloudName = 'dfnpxsczl';      // غيره باسم حسابك في Cloudinary
const uploadPreset = 'ssssss'; // غيره بupload preset الخاص بك (بدون توقيع)


  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);

    // أضف الصور الجديدة إلى السابقة
    setImages(prev => [...prev, ...files]);

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...previewUrls]);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('من فضلك اختر صوراً للرفع');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = images.map(image => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', uploadPreset);

        return axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          formData
        );
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.data.secure_url);
      setUploadedUrls(urls);
      alert('تم رفع جميع الصور بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء رفع الصور');
    }

    setUploading(false);
  };

  return (
    <div className="container mt-4">

      <h3>رفع عدة صور بشكل تراكمي</h3>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="form-control mb-3"
      />

      <div className="d-flex flex-wrap gap-2 mb-3">
        {previews.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Preview ${index}`}
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
          />
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? 'جاري رفع الصور...' : 'ارفع الصور'}
      </button>

      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h5>الصور المرفوعة:</h5>
          <div className="d-flex flex-wrap gap-2">
            {uploadedUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Uploaded ${index}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchUpload;
