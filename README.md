# Expense Tracker

A modern, responsive expense tracking application built with PHP OOP backend, MySQL database, and vanilla JavaScript frontend.

![GitHub](https://img.shields.io/badge/license-MIT-blue)
![PHP](https://img.shields.io/badge/PHP-7.4+-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration system
- 📊 **Interactive Dashboard** - Overview with statistics and visual charts
- 💰 **Expense Management** - Add, edit, view, and delete expenses with ease
- 📷 **Receipt Uploads** - Attach receipt images to expenses for better tracking
- 🏷️ **Category System** - Organize expenses by customizable categories
- 🔍 **Search & Filter** - Find expenses quickly with advanced filtering
- 📱 **Responsive Design** - Mobile-first design, works seamlessly on all devices
- 📈 **Monthly Reports** - Visual breakdown of expenses by category with charts
- 👤 **Profile Management** - Update profile information and change password
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes

## 🚀 Tech Stack

### Backend
- **PHP 7.4+** - Object-Oriented Programming approach
- **MySQL 8.0+** - Relational database management
- **RESTful API** - Clean API architecture

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure JS
- **Chart.js** - Interactive charts for reports

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- PHP 7.4 or higher
- MySQL 8.0 or higher
- Web server (Apache, Nginx, or XAMPP/WAMP/MAMP)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Yeshika11/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Database Setup

#### Option A: Using Command Line
```bash
mysql -u root -p < database/schema.sql
```

#### Option B: Using phpMyAdmin
1. Open phpMyAdmin in your browser
2. Create a new database named `expense_tracker`
3. Import the `database/schema.sql` file

### 3. Configure Database Connection

Edit the file `backend/config/config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'expense_tracker');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 4. Set Directory Permissions

Ensure the uploads directory is writable:

```bash
chmod -R 755 uploads/
```

On Windows, right-click the `uploads` folder and ensure it's not read-only.

### 5. Start the Application

#### Using XAMPP/WAMP
1. Place the project folder in `htdocs` (XAMPP) or `www` (WAMP)
2. Start Apache and MySQL from the control panel
3. Navigate to: `http://localhost/Expense/frontend/login.html`

#### Using PHP Built-in Server
```bash
cd Expense
php -S localhost:8000
```
Then navigate to: `http://localhost:8000/frontend/login.html`

## 📁 Project Structure

```
Expense-Tracker/
├── backend/
│   ├── api/                  # API endpoints
│   │   ├── auth.php         # Authentication API
│   │   ├── expenses.php     # Expense management API
│   │   ├── profile.php      # Profile management API
│   │   └── reports.php      # Reports API
│   ├── classes/             # PHP classes
│   │   ├── Database.php     # Database connection
│   │   ├── User.php         # User model
│   │   └── Expense.php      # Expense model
│   └── config/
│       └── config.php       # Database configuration
├── frontend/
│   ├── css/
│   │   └── styles.css       # Application styles
│   ├── js/
│   │   ├── auth.js          # Authentication logic
│   │   ├── dashboard.js     # Dashboard functionality
│   │   ├── expenses.js      # Expense management
│   │   ├── profile.js       # Profile management
│   │   └── utils.js         # Utility functions
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # Dashboard page
│   ├── expenses.html        # Expense management page
│   ├── monthly-report.html  # Monthly reports page
│   └── profile.html         # User profile page
├── database/
│   └── schema.sql           # Database schema and seed data
├── uploads/                 # Uploaded files
│   ├── profiles/           # Profile pictures
│   └── receipts/           # Receipt images
├── SETUP.md                # Detailed setup instructions
└── README.md               # This file
```

## 💻 Usage

### First Time Setup

1. Navigate to the registration page: `http://localhost/Expense/frontend/register.html`
2. Create a new account with your username, email, and password
3. Login with your credentials
4. Start tracking your expenses!

## 🌟 Key Features Explained

### Dashboard
- View total expenses, monthly expenses, and expense trends
- Interactive charts showing expense distribution by category
- Quick access to recent expenses

### Expense Management
- Add new expenses with category, amount, description, and date
- Upload receipt images for documentation
- Edit or delete existing expenses
- Search and filter expenses by category, date range, or keywords

### Monthly Reports
- Visual breakdown of expenses by category
- Interactive pie/bar charts
- Month-by-month comparison
- Export data capabilities

### Profile Management
- Update username and email
- Change password securely
- Upload profile picture

## 🔧 Configuration

### Customizing Categories

Categories can be managed directly in the database or through the application interface:

Common categories include:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Others

### Theme Customization

The application supports dark and light themes. Users can toggle between themes using the theme switcher in the navigation bar.

## 🌐 GitHub Repository

This project is hosted on GitHub:
- **Repository:** https://github.com/Yeshika11/Expense-Tracker
- **Main Branch:** Production-ready code
- **Dev Branch:** Active development

### Branches

- `main` - Production-ready code
- `dev` - Active development branch
- `feature/auth` - Authentication features
- `feature/ui` - UI improvements

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch from `dev`:
   ```bash
   git checkout -b feature/your-feature-name dev
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request to the `dev` branch

### Pull Request Guidelines

- Ensure your code follows the existing code style
- Test your changes thoroughly
- Update documentation if needed
- Provide a clear description of the changes

## 🐛 Bug Reports

If you encounter any bugs or issues, please:
1. Check if the issue already exists in the [Issues](https://github.com/Yeshika11/Expense-Tracker/issues) section
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

## 📄 License

This project is open source and available for learning and personal projects.

## 👨‍💻 Author

**Yeshika**
- GitHub: [@Yeshika11](https://github.com/Yeshika11)

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- Google Fonts for Inter font family
- The PHP and MySQL communities

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the [SETUP.md](SETUP.md) file for detailed setup instructions

---

**Happy Expense Tracking! 💰**
