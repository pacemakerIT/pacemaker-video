import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImagePreview);

interface FileUploadProps {
  onChange: (files: File[]) => void;
}

const FileUpload = ({ onChange }: FileUploadProps) => {
  return (
    <FilePond
      allowMultiple={false}
      maxFiles={3}
      onupdatefiles={(fileItems) => {
        const uploadedFiles = fileItems.map(
          (fileItem) => fileItem.file as File
        );
        onChange(uploadedFiles);
      }}
      name="files"
      labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
    />
  );
};

export default FileUpload;
