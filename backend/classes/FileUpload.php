<?php
class FileUpload {
    
    public function uploadImage($file, $destination) {
        try {
            // Check if file was uploaded
            if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
                return ['success' => false, 'message' => 'File upload error'];
            }
            
            // Validate file size
            if ($file['size'] > MAX_FILE_SIZE) {
                return ['success' => false, 'message' => 'File size exceeds maximum limit (5MB)'];
            }
            
            // Validate file type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
                return ['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, and WebP are allowed'];
            }
            
            // Generate filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $destination . $filename;
            
            // Create directory 
            if (!is_dir($destination)) {
                mkdir($destination, 0755, true);
            }
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return ['success' => false, 'message' => 'Failed to save file'];
            }
            
            return ['success' => true, 'filename' => $filename];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Upload failed: ' . $e->getMessage()];
        }
    }
    
    public function uploadMultiple($files, $destination) {
        $uploadedFiles = [];
        $errors = [];
        
     
        $fileCount = count($files['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
            
            $result = $this->uploadImage($file, $destination);
            
            if ($result['success']) {
                $uploadedFiles[] = $result['filename'];
            } else {
                $errors[] = $result['message'];
            }
        }
        
        if (!empty($uploadedFiles)) {
            return ['success' => true, 'files' => $uploadedFiles, 'errors' => $errors];
        } else {
            return ['success' => false, 'message' => 'No files uploaded', 'errors' => $errors];
        }
    }
    
    public function deleteFile($filepath) {
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }
}
