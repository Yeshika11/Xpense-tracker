<?php
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

$user = new User();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($action === 'register') {
                $result = $user->register(
                    $data['username'] ?? '',
                    $data['email'] ?? '',
                    $data['password'] ?? ''
                );
                echo json_encode($result);
                
            } elseif ($action === 'login') {
                $result = $user->login(
                    $data['username'] ?? '',
                    $data['password'] ?? ''
                );
                echo json_encode($result);
                
            } elseif ($action === 'logout') {
                $result = $user->logout();
                echo json_encode($result);
                
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
            break;
            
        case 'GET':
            
            // Check if user is logged in
            if ($action === 'check') {
                $isLoggedIn = $user->isLoggedIn();
                echo json_encode([
                    'success' => true,
                    'logged_in' => $isLoggedIn,
                    'user' => $isLoggedIn ? [
                        'id' => $_SESSION['user_id'],
                        'username' => $_SESSION['username'],
                        'email' => $_SESSION['email']
                    ] : null
                ]);
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
