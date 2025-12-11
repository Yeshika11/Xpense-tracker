<?php
class Category {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAll() {
        try {
            $stmt = $this->db->query("SELECT * FROM categories ORDER BY name ASC");
            $categories = $stmt->fetchAll();
            
            return ['success' => true, 'categories' => $categories];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch categories'];
        }
    }
    
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch();
            
            if (!$category) {
                return ['success' => false, 'message' => 'Category not found'];
            }
            
            return ['success' => true, 'category' => $category];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch category'];
        }
    }
}
