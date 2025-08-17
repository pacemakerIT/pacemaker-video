'use client';
import React, { useState } from 'react';
import ImageDownload from './image-download';

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setRecordId('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }
    if (!selectedTable) {
      setError('테이블을 선택해주세요.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('table', selectedTable);
    formData.append('column', 'thumbnail'); // thumbnail로 고정

    // recordId가 비어있지 않을 때만 추가
    if (recordId && recordId.trim() !== '') {
      formData.append('recordId', recordId);
    }

    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.image) {
        setUploadedFileName(data.image.fileName);
        setRecordId('');
      } else {
        setError(data.error || '업로드에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full p-6 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">이미지 업로드</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 업로드 폼 */}
        <div>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* 파일 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 파일
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* 테이블 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                테이블 선택
              </label>
              <select
                value={selectedTable}
                onChange={(e) => handleTableChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">테이블을 선택하세요</option>
                <option value="Video">Video</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            {/* 레코드 ID 입력 (선택사항) */}
            {selectedTable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레코드 ID (선택사항)
                </label>
                <input
                  type="text"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  placeholder="비워두면 새 레코드가 생성됩니다"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  기존 레코드를 업데이트하려면 UUID를 입력하세요. 비워두면 새
                  레코드가 생성됩니다.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file || !selectedTable}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* 다운로드 섹션 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">이미지 다운로드</h3>
          {uploadedFileName ? (
            <ImageDownload fileName={uploadedFileName} />
          ) : (
            <div className="text-gray-500 p-4 border rounded-lg">
              이미지를 업로드하면 여기에 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
