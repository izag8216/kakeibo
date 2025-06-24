# Kakeibo - Personal Finance Web Application 📊

<div align="center">

![GitHub top language](https://img.shields.io/github/languages/top/username/kakeibo)
![GitHub](https://img.shields.io/github/license/username/kakeibo)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/username/kakeibo)
![GitHub last commit](https://img.shields.io/github/last-commit/username/kakeibo)

**A minimalistic and modern personal finance management application**

[📱 Live Demo](https://username.github.io/kakeibo) | [📚 Documentation](./docs/) | [🐛 Issues](https://github.com/username/kakeibo/issues)

</div>

## ✨ Features

- 🎨 **Modern UI**: Beautiful interface powered by Mantine v7
- 🌙 **Dark Mode**: Complete dark/light theme support
- 📱 **Responsive**: Fully optimized for mobile, tablet, and desktop
- ⚡ **Fast**: High-performance powered by React 18 + Vite
- 🧪 **Quality Assured**: Comprehensive test coverage with 28+ test cases
- 💾 **Data Persistence**: Reliable local file storage
- 📊 **Visualization**: Rich graphs and statistical insights

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/username/kakeibo.git
cd kakeibo

# Install dependencies
npm install

# Start development server
npm run dev
```

After the development server starts, open your browser and navigate to `http://localhost:5173`.

## 📋 Key Features

### 💰 Transaction Management
- ✅ Record, edit, and delete income and expenses
- ✅ Category-based classification and management
- ✅ Detailed recording with date, amount, and description
- ✅ Real-time balance calculation

### 📊 Statistics & Analytics
- ✅ Monthly income/expense trend charts
- ✅ Category-wise spending and income analysis
- ✅ Period-specific detailed analysis
- ✅ Automatic savings rate calculation

### 🎛️ Category Management
- ✅ Create, edit, and delete income/expense categories
- ✅ Color coding and visual management
- ✅ Usage tracking functionality

### 🔍 Search & Filter
- ✅ Filter by date, category, and amount
- ✅ Sort functionality (date, amount, category)
- ✅ Bulk selection and deletion

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Mantine v7** - Rich UI component library
- **Recharts** - Data visualization library
- **Vite** - Fast build tool

### Development & Testing
- **Vitest** - Fast test runner
- **React Testing Library** - Component testing
- **ESLint + Prettier** - Code quality management

### Data Management
- **JSON** - Local file storage
- **LocalStorage** - Fallback functionality

## 📁 Project Structure

```
kakeibo/
├── src/
│   ├── components/          # UI Components
│   │   ├── Dashboard.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── Statistics.tsx
│   │   ├── Layout.tsx
│   │   └── __tests__/       # Component tests
│   ├── contexts/           # React Context
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   │   └── __tests__/      # Unit tests
│   ├── test/               # Test configuration & integration tests
│   └── types/              # TypeScript type definitions
├── public/                 # Static files
├── docs/                   # Documentation
└── dist/                   # Build artifacts
```

## 🧪 Testing

Quality is assured through comprehensive test suites.

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Check coverage
npm run test:coverage
```

### Test Coverage
- ✅ **DataManager**: 24 test cases (CRUD operations, validation)
- ✅ **TransactionForm**: 4 basic tests + 28 comprehensive tests
- ✅ **Integration Tests**: End-to-end workflow testing

## 🔧 Build & Deploy

```bash
# Production build
npm run build

# Preview build results
npm run preview

# Run linting
npm run lint
```

## 📊 Usage Guide

### 1. Recording Transactions
1. Select "Add Transaction" from the sidebar
2. Choose income or expense
3. Enter amount, category, date, and description
4. Click the "Save" button

### 2. Category Management
1. Select "Category Management" from the sidebar
2. Click the "New Category" button
3. Set category name and color
4. Save to complete

### 3. Statistics Review
1. Select "Statistics" from the sidebar
2. Specify analysis period
3. Review visualized information in graphs and charts

## 🛡️ Security

- ✅ **Local Data Storage**: All data is stored locally
- ✅ **Input Validation**: Strict validation of form inputs
- ✅ **XSS Protection**: React's standard escaping mechanisms
- ✅ **Dependencies**: Regular security updates

## 🤝 Contributing

Contributions to the project are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Run `npm test` before committing
- Maintain code quality with ESLint + Prettier

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

- 🐛 **Bug Reports**: [Issues](https://github.com/username/kakeibo/issues)
- 💡 **Feature Requests**: [Feature Requests](https://github.com/username/kakeibo/issues/new?template=feature_request.md)
- 📧 **General Questions**: [Discussions](https://github.com/username/kakeibo/discussions)

## 🙏 Acknowledgments

- [Mantine](https://mantine.dev/) - Excellent UI component library
- [Recharts](https://recharts.org/) - Flexible charting library
- [React Testing Library](https://testing-library.com/) - Testing utilities

---

<div align="center">

**⭐ If this project helped you, please consider giving it a star!**

Made with ❤️ by [Claude Code](https://claude.ai/code)

</div>