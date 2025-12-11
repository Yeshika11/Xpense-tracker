<?php
class Expense {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function create($userId, $amount, $categoryId, $date, $notes, $images = []) {
        try {
            $this->db->beginTransaction();
            
            // Insert expense
            $stmt = $this->db->prepare("INSERT INTO expenses (user_id, amount, category_id, date, notes) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $amount, $categoryId, $date, $notes]);
            $expenseId = $this->db->lastInsertId();
            
            // Insert images 
            if (!empty($images)) {
                $stmt = $this->db->prepare("INSERT INTO expense_images (expense_id, image_path) VALUES (?, ?)");
                foreach ($images as $image) {
                    $stmt->execute([$expenseId, $image]);
                }
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Expense created successfully', 'expense_id' => $expenseId];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Failed to create expense: ' . $e->getMessage()];
        }
    }
    
    public function read($userId, $page = 1, $limit = 10, $search = '', $categoryId = null, $startDate = null, $endDate = null, $sortBy = 'date', $sortOrder = 'DESC') {
        try {
            $offset = ($page - 1) * $limit;
            
            // Build query
            $sql = "SELECT e.*, c.name as category_name, c.icon, c.color,
                          (SELECT COUNT(*) FROM expense_images WHERE expense_id = e.id) as image_count
                    FROM expenses e
                    JOIN categories c ON e.category_id = c.id
                    WHERE e.user_id = ?";
            
            $params = [$userId];
            
            // Add filters
            if (!empty($search)) {
                $sql .= " AND (e.notes LIKE ? OR CAST(e.amount AS CHAR) LIKE ?)";
                $searchParam = "%$search%";
                $params[] = $searchParam;
                $params[] = $searchParam;
            }
            
            if ($categoryId) {
                $sql .= " AND e.category_id = ?";
                $params[] = $categoryId;
            }
            
            if ($startDate) {
                $sql .= " AND e.date >= ?";
                $params[] = $startDate;
            }
            
            if ($endDate) {
                $sql .= " AND e.date <= ?";
                $params[] = $endDate;
            }
            
            // Add sorting
            $allowedSort = ['date', 'amount', 'category_name'];
            $sortBy = in_array($sortBy, $allowedSort) ? $sortBy : 'date';
            $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';
            $sql .= " ORDER BY $sortBy $sortOrder";
            
            // Get total count
            $countStmt = $this->db->prepare(str_replace("SELECT e.*, c.name as category_name, c.icon, c.color, (SELECT COUNT(*) FROM expense_images WHERE expense_id = e.id) as image_count", "SELECT COUNT(*)", $sql));
            $countStmt->execute($params);
            $totalRecords = $countStmt->fetchColumn();
            
            // Add pagination
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $expenses = $stmt->fetchAll();
            
            return [
                'success' => true,
                'expenses' => $expenses,
                'pagination' => [
                    'current_page' => (int)$page,
                    'total_pages' => ceil($totalRecords / $limit),
                    'total_records' => (int)$totalRecords,
                    'per_page' => (int)$limit
                ]
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch expenses: ' . $e->getMessage()];
        }
    }
    
    public function readById($expenseId, $userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT e.*, c.name as category_name, c.icon, c.color
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.id = ? AND e.user_id = ?
            ");
            $stmt->execute([$expenseId, $userId]);
            $expense = $stmt->fetch();
            
            if (!$expense) {
                return ['success' => false, 'message' => 'Expense not found'];
            }
            
            // Get images
            $stmt = $this->db->prepare("SELECT * FROM expense_images WHERE expense_id = ?");
            $stmt->execute([$expenseId]);
            $expense['images'] = $stmt->fetchAll();
            
            return ['success' => true, 'expense' => $expense];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch expense'];
        }
    }
    
    public function update($expenseId, $userId, $amount, $categoryId, $date, $notes, $newImages = [], $deleteImageIds = []) {
        try {
            $this->db->beginTransaction();
            
            // Update expense
            $stmt = $this->db->prepare("UPDATE expenses SET amount = ?, category_id = ?, date = ?, notes = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$amount, $categoryId, $date, $notes, $expenseId, $userId]);
            
            // Delete specified images
            if (!empty($deleteImageIds)) {
                $placeholders = str_repeat('?,', count($deleteImageIds) - 1) . '?';
                $stmt = $this->db->prepare("SELECT image_path FROM expense_images WHERE id IN ($placeholders) AND expense_id = ?");
                $stmt->execute(array_merge($deleteImageIds, [$expenseId]));
                $imagesToDelete = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                // Delete from filesystem
                foreach ($imagesToDelete as $imagePath) {
                    $fullPath = EXPENSE_IMG_PATH . $imagePath;
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                }
                
                // Delete from database
                $stmt = $this->db->prepare("DELETE FROM expense_images WHERE id IN ($placeholders) AND expense_id = ?");
                $stmt->execute(array_merge($deleteImageIds, [$expenseId]));
            }
            
            // Add new images
            if (!empty($newImages)) {
                $stmt = $this->db->prepare("INSERT INTO expense_images (expense_id, image_path) VALUES (?, ?)");
                foreach ($newImages as $image) {
                    $stmt->execute([$expenseId, $image]);
                }
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Expense updated successfully'];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Failed to update expense: ' . $e->getMessage()];
        }
    }
    
    public function delete($expenseId, $userId) {
        try {
            $this->db->beginTransaction();
            
            // Get images to delete from filesystem
            $stmt = $this->db->prepare("SELECT image_path FROM expense_images WHERE expense_id = ?");
            $stmt->execute([$expenseId]);
            $images = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Delete expense (cascade will delete images from DB)
            $stmt = $this->db->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
            $stmt->execute([$expenseId, $userId]);
            
            if ($stmt->rowCount() === 0) {
                $this->db->rollBack();
                return ['success' => false, 'message' => 'Expense not found'];
            }
            
            // Delete images from filesystem
            foreach ($images as $image) {
                $fullPath = EXPENSE_IMG_PATH . $image;
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Expense deleted successfully'];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Failed to delete expense'];
        }
    }
    
    public function getMonthlyReport($userId, $year, $month) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    SUM(amount) as total,
                    COUNT(*) as count,
                    c.name as category,
                    c.color
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.user_id = ? AND YEAR(e.date) = ? AND MONTH(e.date) = ?
                GROUP BY e.category_id, c.name, c.color
                ORDER BY total DESC
            ");
            $stmt->execute([$userId, $year, $month]);
            $breakdown = $stmt->fetchAll();
            
            $total = array_sum(array_column($breakdown, 'total'));
            
            return [
                'success' => true,
                'report' => [
                    'total' => $total,
                    'breakdown' => $breakdown,
                    'month' => $month,
                    'year' => $year
                ]
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to generate report'];
        }
    }
    
    public function getDashboardStats($userId) {
        try {
            // Total expenses
            $stmt = $this->db->prepare("SELECT SUM(amount) as total FROM expenses WHERE user_id = ?");
            $stmt->execute([$userId]);
            $totalExpenses = $stmt->fetchColumn() ?? 0;
            
            // Current month expenses
            $stmt = $this->db->prepare("SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())");
            $stmt->execute([$userId]);
            $monthlyExpenses = $stmt->fetchColumn() ?? 0;
            
            // Total count
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM expenses WHERE user_id = ?");
            $stmt->execute([$userId]);
            $expenseCount = $stmt->fetchColumn();
            
            // Top category
            $stmt = $this->db->prepare("
                SELECT c.name, c.icon, SUM(e.amount) as total
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.user_id = ?
                GROUP BY e.category_id
                ORDER BY total DESC
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $topCategory = $stmt->fetch();
            
            // Recent expenses
            $stmt = $this->db->prepare("
                SELECT e.*, c.name as category_name, c.icon, c.color
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.user_id = ?
                ORDER BY e.date DESC, e.created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$userId]);
            $recentExpenses = $stmt->fetchAll();
            
            // Monthly trend (last 6 months)
            $stmt = $this->db->prepare("
                SELECT 
                    DATE_FORMAT(date, '%Y-%m') as month,
                    SUM(amount) as total
                FROM expenses
                WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month ASC
            ");
            $stmt->execute([$userId]);
            $monthlyTrend = $stmt->fetchAll();
            
            return [
                'success' => true,
                'stats' => [
                    'total_expenses' => $totalExpenses,
                    'monthly_expenses' => $monthlyExpenses,
                    'expense_count' => $expenseCount,
                    'top_category' => $topCategory,
                    'recent_expenses' => $recentExpenses,
                    'monthly_trend' => $monthlyTrend
                ]
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch stats'];
        }
    }
}
