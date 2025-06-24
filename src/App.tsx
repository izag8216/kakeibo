import { useState } from 'react';
import { Center, Loader, Stack, Text, Title, Button, ThemeIcon, Card, MantineProvider, createTheme, Grid, Box, Alert, SimpleGrid, Paper, Group } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { IconAlertCircle, IconRefresh, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTheme } from './contexts/ThemeContext';

// Components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager';
import Statistics from './components/Statistics';

// Hooks and utilities
import { useLocalStorage } from './hooks/useLocalStorage';
import { DataManager } from './utils/dataManager';

// Types
import { Transaction, AppData } from './types';

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    'ocean-blue': ['#7AD1DD', '#5FCCDB', '#44CADC', '#2AC9DE', '#1AC2D9', '#11B7CD', '#09ADC3', '#0E99AC', '#128797', '#147885'],
    'bright-pink': ['#F0BBDD', '#ED9BCF', '#EC7CC3', '#ED5DB8', '#F13EAF', '#F71FA7', '#FF00A1', '#E00890', '#C50E82', '#AD1374'],
  },
  fontFamily: '"Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN", "Yu Gothic Medium", "游ゴシック Medium", "YuGothic", "游ゴシック体", "Meiryo", "メイリオ", sans-serif',
  headings: {
    fontFamily: '"Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN", "Yu Gothic Medium", "游ゴシック Medium", "YuGothic", "游ゴシック体", "Meiryo", "メイリオ", sans-serif',
  },
  radius: {
    md: '8px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
});

function AppContent() {
  const { data, loading, error, saveData, loadDummyData } = useLocalStorage();
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // データが読み込まれていない場合のローディング画面
  if (loading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="xl" variant="bars" />
          <Text color="dimmed">データを読み込んでいます...</Text>
        </Stack>
      </Center>
    );
  }

  // エラーが発生した場合のエラー画面
  if (error || !data) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Card shadow="md" radius="lg" p="xl" style={{ maxWidth: 400 }}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="red" variant="light">
              <IconAlertCircle size={30} />
            </ThemeIcon>
            <Title order={2} ta="center">エラーが発生しました</Title>
            <Text c="dimmed" ta="center">
              {error || 'データの読み込みに失敗しました'}
            </Text>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={() => window.location.reload()}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              再読み込み
            </Button>
          </Stack>
        </Card>
      </Center>
    );
  }

  // ダッシュボードデータを取得
  const dashboardData = DataManager.getDashboardData(data);

  // 取引を保存
  const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      let updatedData: AppData;
      
      if (editingTransaction) {
        // 編集モード
        updatedData = DataManager.updateTransaction(data, editingTransaction.id, transactionData);
      } else {
        // 新規作成モード
        updatedData = DataManager.addTransaction(data, transactionData);
      }
      
      await saveData(updatedData);
      
      // 編集モードをリセット
      setEditingTransaction(null);
      
      // ダッシュボードに戻る
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Transaction save error:', err);
      throw err;
    }
  };

  // 取引を編集
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setCurrentView('add-transaction');
  };

  // 取引を削除
  const handleDeleteTransaction = async (id: string) => {
    try {
      const updatedData = DataManager.deleteTransaction(data, id);
      await saveData(updatedData);
    } catch (err) {
      console.error('Transaction delete error:', err);
    }
  };

  // フォームをキャンセル
  const handleCancelForm = () => {
    setEditingTransaction(null);
    setCurrentView('dashboard');
  };

  // ビューを変更
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // 新しいビューに移動するときは編集モードをリセット
    if (view !== 'add-transaction') {
      setEditingTransaction(null);
    }
  };

  // 現在のビューに基づいてコンテンツを表示
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            dashboardData={dashboardData}
            categories={data.categories}
            onViewTransactions={() => setCurrentView('transactions')}
            onAddTransaction={() => setCurrentView('add-transaction')}
          />
        );
      
      case 'add-transaction':
        return (
          <TransactionForm
            categories={data.categories}
            editingTransaction={editingTransaction}
            onSave={handleSaveTransaction}
            onCancel={handleCancelForm}
          />
        );
      
      case 'transactions':
        return (
          <TransactionList
            transactions={data.transactions}
            categories={data.categories}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        );
      
      case 'categories':
        return (
          <CategoryManager
            categories={data.categories}
            data={data}
            onSave={saveData}
          />
        );
      
      case 'statistics':
        return (
          <Statistics data={data} />
        );
      
      case 'settings':
        return (
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Title order={2} mb="xs">設定</Title>
                <Text c="dimmed">アプリの設定とデータ管理</Text>
              </Box>
            </Group>

            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="md" radius="lg" p="xl">
                  <Group justify="space-between" mb="lg">
                    <div>
                      <Text size="lg" fw={600} mb={4}>テーマ設定</Text>
                      <Text size="sm" c="dimmed">アプリの外観を変更</Text>
                    </div>
                    <ThemeIcon variant="light" size="lg" color="blue">
                      <IconRefresh size={20} />
                    </ThemeIcon>
                  </Group>
                  
                  <Text size="sm" mb="md">
                    テーマ切り替えはヘッダーの太陽/月アイコンから行えます
                  </Text>
                  
                  <Alert color="blue" radius="md">
                    <Text size="sm">
                      ライト/ダークテーマの切り替えが可能です
                    </Text>
                  </Alert>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="md" radius="lg" p="xl">
                  <Group justify="space-between" mb="lg">
                    <div>
                      <Text size="lg" fw={600} mb={4}>データ管理</Text>
                      <Text size="sm" c="dimmed">データの操作</Text>
                    </div>
                    <ThemeIcon variant="light" size="lg" color="green">
                      <IconRefresh size={20} />
                    </ThemeIcon>
                  </Group>
                  
                  <Stack gap="md">
                    <Text size="sm" mb="md">
                      サンプルデータをロードして、アプリの機能をテストできます
                    </Text>
                    
                    <Button
                      leftSection={<IconRefresh size={16} />}
                      onClick={loadDummyData}
                      variant="light"
                      color="blue"
                      fullWidth
                    >
                      ダミーデータをロード
                    </Button>

                    <Alert color="yellow" radius="md">
                      <Text size="sm">
                        既存のデータは上書きされます
                      </Text>
                    </Alert>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={12}>
                <Card shadow="md" radius="lg" p="xl">
                  <Group justify="space-between" mb="lg">
                    <div>
                      <Text size="lg" fw={600} mb={4}>データエクスポート</Text>
                      <Text size="sm" c="dimmed">データのバックアップとエクスポート</Text>
                    </div>
                    <ThemeIcon variant="light" size="lg" color="orange">
                      <IconRefresh size={20} />
                    </ThemeIcon>
                  </Group>
                  
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => {
                        const jsonData = DataManager.exportData(data, 'json');
                        const blob = new Blob([jsonData], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kakeibo-backup-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        notifications.show({
                          title: 'エクスポート完了',
                          message: 'JSONファイルをダウンロードしました',
                          color: 'green',
                          icon: <IconCheck size={16} />,
                        });
                      }}
                    >
                      JSON出力
                    </Button>
                    
                    <Button
                      variant="light"
                      color="green"
                      onClick={() => {
                        const csvData = DataManager.exportData(data, 'csv');
                        const blob = new Blob([csvData], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kakeibo-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        notifications.show({
                          title: 'エクスポート完了',
                          message: 'CSVファイルをダウンロードしました',
                          color: 'green',
                          icon: <IconCheck size={16} />,
                        });
                      }}
                    >
                      CSV出力
                    </Button>
                    
                    <Button
                      variant="light"
                      color="gray"
                      onClick={() => {
                        notifications.show({
                          title: '開発中',
                          message: 'PDF出力機能は開発中です',
                          color: 'blue',
                        });
                      }}
                    >
                      PDF出力
                    </Button>
                  </SimpleGrid>
                </Card>
              </Grid.Col>

              <Grid.Col span={12}>
                <Card shadow="md" radius="lg" p="xl">
                  <Group justify="space-between" mb="lg">
                    <div>
                      <Text size="lg" fw={600} mb={4}>アプリ情報</Text>
                      <Text size="sm" c="dimmed">バージョンとシステム情報</Text>
                    </div>
                    <ThemeIcon variant="light" size="lg" color="gray">
                      <IconRefresh size={20} />
                    </ThemeIcon>
                  </Group>
                  
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <Paper withBorder p="md" radius="md">
                      <Text size="sm" c="dimmed" mb="xs">バージョン</Text>
                      <Text fw={500}>{data.version}</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                      <Text size="sm" c="dimmed" mb="xs">取引件数</Text>
                      <Text fw={500}>{data.transactions.length}件</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                      <Text size="sm" c="dimmed" mb="xs">カテゴリ数</Text>
                      <Text fw={500}>{data.categories.length}件</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                      <Text size="sm" c="dimmed" mb="xs">最終更新</Text>
                      <Text fw={500} lineClamp={1}>
                        {new Date(data.lastUpdated).toLocaleDateString('ja-JP')}
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        );
      
      default:
        return (
          <Card shadow="md" radius="lg" p="xl">
            <Title order={2} mb="md">ページが見つかりません</Title>
            <Text color="dimmed">指定されたページは存在しません。</Text>
          </Card>
        );
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}
    </Layout>
  );
}

function App() {
  const { colorScheme } = useTheme();

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme === 'auto' ? 'light' : colorScheme}>
      <ModalsProvider>
        <Notifications />
        <AppContent />
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;