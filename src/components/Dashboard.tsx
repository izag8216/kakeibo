import React from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Stack,
  SimpleGrid,
  Box,
  ThemeIcon,
  Title,
  Progress,
  Center,
  Timeline,
  Button,
  Alert,
} from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCoin,
  IconReceipt,
  IconPlus,
  IconEye,
  IconCalendar,
  IconCreditCard,
  IconInfoCircle,
  IconTarget,
} from '@tabler/icons-react';
import { DashboardData, Category } from '../types';
import { DataManager } from '../utils/dataManager';

interface DashboardProps {
  dashboardData: DashboardData;
  categories: Category[];
  onViewTransactions: () => void;
  onAddTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  dashboardData,
  categories,
  onViewTransactions,
  onAddTransaction,
}) => {
  const {
    currentMonthIncome,
    currentMonthExpense,
    currentMonthBalance,
    recentTransactions,
    monthlyStats,
    categoryStats,
  } = dashboardData;

  const currentMonth = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Unknown',
      color: category?.color || '#6b7280',
    };
  };

  // チャート用データの準備
  const chartData = monthlyStats.slice(-6).map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('ja-JP', { month: 'short' }),
    収入: month.income,
    支出: month.expense,
    収支: month.balance,
  }));

  const donutData = categoryStats.slice(0, 5).map(stat => ({
    name: stat.categoryName,
    value: stat.amount,
    color: stat.color,
  }));

  const StatCard: React.FC<{
    title: string;
    value: number;
    type: 'income' | 'expense' | 'balance';
    icon: React.ReactNode;
    trend?: number;
  }> = ({ title, value, type, icon, trend }) => {
    const colors = {
      income: { bg: 'teal', gradient: 'income-gradient' },
      expense: { bg: 'red', gradient: 'expense-gradient' },
      balance: { bg: 'blue', gradient: 'balance-gradient' },
    };

    const color = colors[type];
    const isPositive = type === 'balance' ? value >= 0 : true;

    return (
      <Card 
        shadow="md" 
        radius="lg" 
        p="lg"
        className="hover-lift"
        style={{
          background: `linear-gradient(135deg, ${
            type === 'income' ? '#11998e, #38ef7d' :
            type === 'expense' ? '#ff512f, #f09819' :
            '#667eea, #764ba2'
          })`,
          color: 'white',
        }}
      >
        <Group justify="space-between" mb="md">
          <ThemeIcon size={50} radius="md" variant="white" color={color.bg}>
            {icon}
          </ThemeIcon>
          {trend && (
            <Badge
              variant="white"
              color={color.bg}
              size="sm"
              leftSection={
                trend > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />
              }
            >
              {Math.abs(trend)}%
            </Badge>
          )}
        </Group>

        <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }} mb={4}>
          {title}
        </Text>
        
        <Text size="xl" fw={700} mb="xs">
          {type === 'balance' && !isPositive && '-'}
          {DataManager.formatAmount(Math.abs(value))}
        </Text>
        
        <Group gap={4}>
          {isPositive ? (
            <IconArrowUpRight size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
          ) : (
            <IconArrowDownRight size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
          )}
          <Text size="xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
            今月の{title.toLowerCase()}
          </Text>
        </Group>
      </Card>
    );
  };

  return (
    <Stack gap="xl">
      {/* ヘッダー */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={1} mb="xs">
            ダッシュボード
          </Title>
          <Group gap="xs" align="center">
            <IconCalendar size={16} />
            <Text c="dimmed">{currentMonth}の収支状況</Text>
          </Group>
        </Box>
        
        <Group gap="md">
          <Button
            leftSection={<IconEye size={16} />}
            variant="light"
            onClick={onViewTransactions}
          >
            全取引を表示
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            gradient={{ from: 'blue', to: 'cyan' }}
            variant="gradient"
            onClick={onAddTransaction}
            className="pulse-animation"
          >
            取引を追加
          </Button>
        </Group>
      </Group>

      {/* アラート */}
      {currentMonthBalance < 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="収支に注意"
          color="orange"
          radius="lg"
        >
          今月は支出が収入を上回っています。家計の見直しを検討してください。
        </Alert>
      )}

      {/* メインの統計カード */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        <StatCard
          title="今月の収入"
          value={currentMonthIncome}
          type="income"
          icon={<IconTrendingUp size={24} />}
          trend={12}
        />
        <StatCard
          title="今月の支出"
          value={currentMonthExpense}
          type="expense"
          icon={<IconTrendingDown size={24} />}
          trend={-5}
        />
        <StatCard
          title="今月の収支"
          value={currentMonthBalance}
          type="balance"
          icon={<IconWallet size={24} />}
          trend={8}
        />
      </SimpleGrid>

      {/* チャートとリスト */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="md" radius="lg" p="lg" className="hover-lift">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  月別収支推移
                </Text>
                <Text size="sm" c="dimmed">
                  過去6ヶ月の収支傾向
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg">
                <IconTarget size={20} />
              </ThemeIcon>
            </Group>
            
            {chartData.length > 0 ? (
              <AreaChart
                h={300}
                data={chartData}
                dataKey="month"
                series={[
                  { name: '収入', color: 'teal.6', strokeDasharray: '5 5' },
                  { name: '支出', color: 'red.6', strokeDasharray: '5 5' },
                  { name: '収支', color: 'blue.6' },
                ]}
                curveType="linear"
                gridAxis="xy"
                withGradient
                fillOpacity={0.2}
                strokeWidth={3}
              />
            ) : (
              <Center h={300}>
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} variant="light" color="gray">
                    <IconTarget size={30} />
                  </ThemeIcon>
                  <Text c="dimmed">データがありません</Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="md" radius="lg" p="lg" h="100%" className="hover-lift">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  カテゴリ別支出
                </Text>
                <Text size="sm" c="dimmed">
                  今月の支出内訳
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg" color="orange">
                <IconCreditCard size={20} />
              </ThemeIcon>
            </Group>

            {donutData.length > 0 ? (
              <>
                <Center mb="md">
                  <DonutChart
                    data={donutData}
                    size={200}
                    thickness={30}
                    withLabelsLine
                    withLabels
                  />
                </Center>
                
                <Stack gap="xs">
                  {categoryStats.slice(0, 3).map((stat) => (
                    <Group key={stat.categoryId} justify="space-between">
                      <Group gap="xs">
                        <Box
                          w={12}
                          h={12}
                          style={{
                            backgroundColor: stat.color,
                            borderRadius: 2,
                          }}
                        />
                        <Text size="sm">{stat.categoryName}</Text>
                      </Group>
                      <Text size="sm" fw={500}>
                        {stat.percentage.toFixed(1)}%
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Center h={200}>
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} variant="light" color="gray">
                    <IconCreditCard size={30} />
                  </ThemeIcon>
                  <Text c="dimmed">支出データがありません</Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* 最近の取引と今月の目標 */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="md" radius="lg" p="lg" className="hover-lift">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  最近の取引
                </Text>
                <Text size="sm" c="dimmed">
                  直近の取引履歴
                </Text>
              </div>
              <Button
                variant="subtle"
                size="xs"
                onClick={onViewTransactions}
                rightSection={<IconArrowUpRight size={14} />}
              >
                すべて表示
              </Button>
            </Group>

            {recentTransactions.length > 0 ? (
              <Timeline active={recentTransactions.length} bulletSize={24} lineWidth={2}>
                {recentTransactions.map((transaction) => {
                  const categoryInfo = getCategoryInfo(transaction.category);
                  return (
                    <Timeline.Item
                      key={transaction.id}
                      bullet={
                        <ThemeIcon
                          size={24}
                          variant="light"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          <IconReceipt size={14} />
                        </ThemeIcon>
                      }
                      title={
                        <Group justify="space-between">
                          <Text fw={500}>{categoryInfo.name}</Text>
                          <Badge
                            variant="light"
                            color={transaction.type === 'income' ? 'teal' : 'red'}
                            size="sm"
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {DataManager.formatAmount(transaction.amount)}
                          </Badge>
                        </Group>
                      }
                    >
                      <Text size="sm" c="dimmed" mb={4}>
                        {DataManager.formatDate(transaction.date, 'MM/DD')}
                        {transaction.description && ` • ${transaction.description}`}
                      </Text>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            ) : (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} variant="light" color="gray">
                    <IconReceipt size={30} />
                  </ThemeIcon>
                  <Text c="dimmed">取引がありません</Text>
                  <Button
                    variant="light"
                    onClick={onAddTransaction}
                    leftSection={<IconPlus size={16} />}
                  >
                    最初の取引を追加
                  </Button>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* 今月の目標 */}
            <Card shadow="md" radius="lg" p="lg" className="hover-lift">
              <Group justify="space-between" mb="md">
                <Text size="lg" fw={600}>
                  今月の目標
                </Text>
                <ThemeIcon variant="light" size="lg" color="green">
                  <IconTarget size={20} />
                </ThemeIcon>
              </Group>

              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">支出目標</Text>
                    <Text size="sm" fw={500}>
                      {DataManager.formatAmount(currentMonthExpense)} / ¥300,000
                    </Text>
                  </Group>
                  <Progress
                    value={(currentMonthExpense / 300000) * 100}
                    color={currentMonthExpense > 300000 ? 'red' : 'blue'}
                    size="lg"
                    radius="xl"
                  />
                </div>

                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">貯蓄目標</Text>
                    <Text size="sm" fw={500}>
                      {DataManager.formatAmount(Math.max(0, currentMonthBalance))} / ¥100,000
                    </Text>
                  </Group>
                  <Progress
                    value={(Math.max(0, currentMonthBalance) / 100000) * 100}
                    color="green"
                    size="lg"
                    radius="xl"
                  />
                </div>
              </Stack>
            </Card>

            {/* クイックアクション */}
            <Card shadow="md" radius="lg" p="lg" className="hover-lift">
              <Text size="lg" fw={600} mb="md">
                クイックアクション
              </Text>
              
              <Stack gap="sm">
                <Button
                  fullWidth
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={onAddTransaction}
                >
                  取引を追加
                </Button>
                <Button
                  fullWidth
                  variant="light"
                  leftSection={<IconReceipt size={16} />}
                  onClick={onViewTransactions}
                >
                  履歴を確認
                </Button>
                <Button
                  fullWidth
                  variant="light"
                  leftSection={<IconCoin size={16} />}
                  onClick={() => {}}
                >
                  予算を設定
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Dashboard;