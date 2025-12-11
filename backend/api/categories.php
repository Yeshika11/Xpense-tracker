<?php
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/Category.php';

$category = new Category();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $result = $category->getById($_GET['id']);
        } else {
            $result = $category->getAll();
        }
        echo json_encode($result);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
