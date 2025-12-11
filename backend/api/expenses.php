<?php
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';
require_once '../classes/Expense.php';
require_once '../classes/FileUpload.php';

$user = new User();
$expense = new Expense();
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
            if ($action === 'monthly_report') {
                $year = $_GET['year'] ?? date('Y');
                $month = $_GET['month'] ?? date('m');
                $result = $expense->getMonthlyReport($userId, $year, $month);
                echo json_encode($result);
                
            } elseif ($action === 'dashboard') {
                $result = $expense->getDashboardStats($userId);
                echo json_encode($result);
                
            } elseif (isset($_GET['id'])) {
                $result = $expense->readById($_GET['id'], $userId);
                echo json_encode($result);
                
            } else {
                $page = $_GET['page'] ?? 1;
                $limit = $_GET['limit'] ?? 10;
                $search = $_GET['search'] ?? '';
                $categoryId = $_GET['category'] ?? null;
                $startDate = $_GET['start_date'] ?? null;
                $endDate = $_GET['end_date'] ?? null;
                $sortBy = $_GET['sort_by'] ?? 'date';
                $sortOrder = $_GET['sort_order'] ?? 'DESC';
                
                $result = $expense->read($userId, $page, $limit, $search, $categoryId, $startDate, $endDate, $sortBy, $sortOrder);
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Handle image uploads
            $images = [];
            if (isset($_FILES['images'])) {
                $uploadResult = $fileUpload->uploadMultiple($_FILES['images'], EXPENSE_IMG_PATH);
                if ($uploadResult['success']) {
                    $images = $uploadResult['files'];
                }
            }
            
            $result = $expense->create(
                $userId,
                $_POST['amount'],
                $_POST['category_id'],
                $_POST['date'],
                $_POST['notes'] ?? '',
                $images
            );
            echo json_encode($result);
            break;
            
        case 'PUT':
            parse_str(file_get_contents('php://input'), $_PUT);
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Expense ID required']);
                exit;
            }
            
            $result = $expense->update(
                $_GET['id'],
                $userId,
                $data['amount'],
                $data['category_id'],
                $data['date'],
                $data['notes'] ?? '',
                $data['new_images'] ?? [],
                $data['delete_images'] ?? []
            );
            echo json_encode($result);
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Expense ID required']);
                exit;
            }
            
            $result = $expense->delete($_GET['id'], $userId);
            echo json_encode($result);
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
