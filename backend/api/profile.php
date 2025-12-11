<?php
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';
require_once '../classes/FileUpload.php';

$user = new User();
$fileUpload = new FileUpload();

// Check if user is logged in
if (!$user->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $user->getUserId();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            $result = $user->getProfile($userId);
            echo json_encode($result);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($action === 'change_password') {
                $result = $user->updatePassword(
                    $userId,
                    $data['current_password'] ?? '',
                    $data['new_password'] ?? ''
                );
            } else {
                $result = $user->updateProfile(
                    $userId,
                    $data['username'] ?? '',
                    $data['email'] ?? ''
                );
            }
            echo json_encode($result);
            break;
            
        case 'POST':
            if ($action === 'upload_picture') {
                if (!isset($_FILES['profile_picture'])) {
                    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
                    exit;
                }
                
                $uploadResult = $fileUpload->uploadImage($_FILES['profile_picture'], PROFILE_PATH);
                
                if ($uploadResult['success']) {
                    $result = $user->updateProfilePicture($userId, $uploadResult['filename']);
                    if ($result['success']) {
                        $result['filename'] = $uploadResult['filename'];
                    }
                    echo json_encode($result);
                } else {
                    echo json_encode($uploadResult);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
