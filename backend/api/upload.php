<?php
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/Expense.php';
require_once '../classes/FileUpload.php';
require_once '../classes/User.php';

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
$expenseId = $_GET['id'] ?? null;

if (!$expenseId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Expense ID required']);
    exit;
}

// Handle image uploads
$images = [];
if (isset($_FILES['images'])) {
    $uploadResult = $fileUpload->uploadMultiple($_FILES['images'], EXPENSE_IMG_PATH);
    if ($uploadResult['success']) {
        $images = $uploadResult['files'];
    }
}

$deleteImages = isset($_POST['delete_images']) ? json_decode($_POST['delete_images'], true) : [];

$result = $expense->update(
    $expenseId,
    $userId,
    $_POST['amount'],
    $_POST['category_id'],
    $_POST['date'],
    $_POST['notes'] ?? '',
    $images,
    $deleteImages
);

echo json_encode($result);
