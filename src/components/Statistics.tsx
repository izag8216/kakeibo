import React, { useState, useMemo } from 'react';
import {
  Stack,
  Card,
  Title,
  Text,
  Group,
  Select,
  Grid,
  Box,
  ThemeIcon,
  Center,
  Alert,
  ColorSwatch,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { AreaChart, BarChart, DonutChart, LineChart } from '@mantine/charts';
import {
  IconChartArea,
  IconChartDonut,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconTarget,
  IconInfoCircle,
  IconChartLine,
  IconReportAnalytics,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { AppData } from '../types';
import { DataManager } from '../utils/dataManager';

interface StatisticsProps {
  data: AppData;
}

type PeriodType = 'month' | 'quarter' | 'year' | 'custom';
type ChartType = 'area' | 'bar' | 'line';

const Statistics: React.FC<StatisticsProps> = ({ data }) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 期間に基づいてデータをフィルタリング
  const filteredTransactions = useMemo(() => {
    let fromDate: Date;
    let toDate = new Date();

    switch (period) {
      case 'month':
        fromDate = dayjs().subtract(6, 'month').startOf('month').toDate();
        break;
      case 'quarter':
        fromDate = dayjs().subtract(12, 'month').startOf('month').toDate();
        break;
      case 'year':
        fromDate = dayjs().subtract(3, 'year').startOf('year').toDate();
        break;
      case 'custom':
        if (!dateFrom || !dateTo) return data.transactions;
        fromDate = dateFrom;
        toDate = dateTo;
        break;
      default:
        fromDate = dayjs().subtract(6, 'month').toDate();
    }

    return data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const isInDateRange = transactionDate >= fromDate && transactionDate <= toDate;
      const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
      return isInDateRange && matchesCategory;
    });
  }, [data.transactions, period, dateFrom, dateTo, selectedCategory]);

  // 月別統計データ
  const monthlyStats = useMemo(() => {
    return DataManager.getMonthlyStats(filteredTransactions);
  }, [filteredTransactions]);

  // カテゴリ別統計
  const incomeStats = useMemo(() => {
    return DataManager.getCategoryStats(filteredTransactions, data.categories, 'income');
  }, [filteredTransactions, data.categories]);

  const expenseStats = useMemo(() => {
    return DataManager.getCategoryStats(filteredTransactions, data.categories, 'expense');
  }, [filteredTransactions, data.categories]);

  // チャート用データの準備
  const chartData = useMemo(() => {
    return monthlyStats.slice(-12).map(stat => ({
      month: dayjs(stat.month + '-01').format('YYYY/MM'),
      収入: stat.income,
      支出: stat.expense,
      収支: stat.balance,
    }));
  }, [monthlyStats]);

  // 収支サマリー
  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // 日別平均
  const dailyAverages = useMemo(() => {
    if (filteredTransactions.length === 0) return { income: 0, expense: 0 };

    const uniqueDates = new Set(filteredTransactions.map(t => t.date));
    const dayCount = uniqueDates.size;

    return {
      income: summary.totalIncome / dayCount,
      expense: summary.totalExpense / dayCount,
    };
  }, [filteredTransactions, summary]);

  const donutIncomeData = incomeStats.slice(0, 6).map(stat => ({
    name: stat.categoryName,
    value: stat.amount,
    color: stat.color,
  }));

  const donutExpenseData = expenseStats.slice(0, 6).map(stat => ({
    name: stat.categoryName,
    value: stat.amount,
    color: stat.color,
  }));

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <Center h={400}>
          <Stack align="center">
            <ThemeIcon size={60} variant="light" color="gray">
              <IconChartArea size={30} />
            </ThemeIcon>
            <Text c="dimmed">データがありません</Text>
          </Stack>
        </Center>
      );
    }

    const commonProps = {
      h: 400,
      data: chartData,
      dataKey: 'month',
      series: [
        { name: '収入', color: 'teal.6' },
        { name: '支出', color: 'red.6' },
        { name: '収支', color: 'blue.6' },
      ],
      gridAxis: 'xy' as const,
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart
            {...commonProps}
            curveType="natural"
            withGradient
            fillOpacity={0.3}
          />
        );
      case 'bar':
        return (
          <BarChart
            {...commonProps}
            type="default"
          />
        );
      case 'line':
        return (
          <LineChart
            {...commonProps}
            strokeWidth={3}
            curveType="natural"
          />
        );
      default:
        return null;
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    format?: 'currency' | 'percentage' | 'number';
  }> = ({ title, value, subtitle, icon, color, format = 'currency' }) => {
    const formatValue = () => {
      switch (format) {
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'number':
          return value.toLocaleString();
        case 'currency':
        default:
          return DataManager.formatAmount(Math.abs(value));
      }
    };

    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <ThemeIcon size={40} variant="light" color={color}>
            {icon}
          </ThemeIcon>
          <Text size="xl" fw={700} c={value < 0 && format === 'currency' ? 'red' : undefined}>
            {value < 0 && format === 'currency' && '-'}
            {formatValue()}
          </Text>
        </Group>
        <Text size="sm" fw={500} mb={4}>
          {title}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <Stack gap="lg">
      {/* ヘッダー */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} mb="xs">
            統計・分析
          </Title>
          <Text c="dimmed">
            詳細な収支分析とトレンドを確認できます
          </Text>
        </Box>
      </Group>

      {/* フィルター */}
      <Card shadow="sm" radius="md" p="lg" withBorder>
        <Text fw={500} mb="md" size="sm">
          表示期間とオプション
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="表示期間"
              value={period}
              onChange={(value) => setPeriod(value as PeriodType)}
              data={[
                { value: 'month', label: '過去6ヶ月' },
                { value: 'quarter', label: '過去4四半期' },
                { value: 'year', label: '過去3年' },
                { value: 'custom', label: 'カスタム' },
              ]}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="グラフ種類"
              value={chartType}
              onChange={(value) => setChartType(value as ChartType)}
              data={[
                { value: 'area', label: 'エリアチャート' },
                { value: 'bar', label: '棒グラフ' },
                { value: 'line', label: '線グラフ' },
              ]}
            />
          </Grid.Col>

          {period === 'custom' && (
            <>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <DateInput
                  label="開始日"
                  placeholder="開始日を選択"
                  value={dateFrom}
                  onChange={setDateFrom}
                  maxDate={dateTo || new Date()}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <DateInput
                  label="終了日"
                  placeholder="終了日を選択"
                  value={dateTo}
                  onChange={setDateTo}
                  minDate={dateFrom || undefined}
                  maxDate={new Date()}
                />
              </Grid.Col>
            </>
          )}

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="カテゴリフィルター"
              placeholder="すべて"
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || '')}
              data={[
                { value: '', label: 'すべて' },
                ...data.categories.map(cat => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              clearable
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* サマリーカード */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
        <StatCard
          title="総収入"
          value={summary.totalIncome}
          subtitle="選択期間の合計"
          icon={<IconTrendingUp size={20} />}
          color="teal"
        />
        <StatCard
          title="総支出"
          value={summary.totalExpense}
          subtitle="選択期間の合計"
          icon={<IconTrendingDown size={20} />}
          color="red"
        />
        <StatCard
          title="収支"
          value={summary.balance}
          subtitle="収入 - 支出"
          icon={<IconWallet size={20} />}
          color={summary.balance >= 0 ? 'blue' : 'red'}
        />
        <StatCard
          title="貯蓄率"
          value={summary.savingsRate}
          subtitle="収入に占める割合"
          icon={<IconTarget size={20} />}
          color="green"
          format="percentage"
        />
      </SimpleGrid>

      {/* メイングラフ */}
      <Card shadow="md" radius="lg" p="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Text size="lg" fw={600} mb={4}>
              収支推移
            </Text>
            <Text size="sm" c="dimmed">
              期間別の収入・支出・収支の推移
            </Text>
          </div>
          <ThemeIcon variant="light" size="lg">
            <IconChartLine size={20} />
          </ThemeIcon>
        </Group>
        {renderChart()}
      </Card>

      {/* カテゴリ別分析 */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="md" radius="lg" p="xl" h="100%">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  収入カテゴリ別分析
                </Text>
                <Text size="sm" c="dimmed">
                  収入源の内訳
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg" color="teal">
                <IconChartDonut size={20} />
              </ThemeIcon>
            </Group>

            {donutIncomeData.length > 0 ? (
              <>
                <Center mb="md">
                  <DonutChart
                    data={donutIncomeData}
                    size={200}
                    thickness={30}
                    withLabels
                    withLabelsLine
                  />
                </Center>
                <Stack gap="xs">
                  {incomeStats.slice(0, 5).map((stat) => (
                    <Group key={stat.categoryId} justify="space-between">
                      <Group gap="xs">
                        <ColorSwatch color={stat.color} size={12} />
                        <Text size="sm">{stat.categoryName}</Text>
                      </Group>
                      <div style={{ textAlign: 'right' }}>
                        <Text size="sm" fw={500}>
                          {DataManager.formatAmount(stat.amount)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {stat.percentage.toFixed(1)}%
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Center h={200}>
                <Text c="dimmed">収入データがありません</Text>
              </Center>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="md" radius="lg" p="xl" h="100%">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  支出カテゴリ別分析
                </Text>
                <Text size="sm" c="dimmed">
                  支出先の内訳
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg" color="red">
                <IconChartDonut size={20} />
              </ThemeIcon>
            </Group>

            {donutExpenseData.length > 0 ? (
              <>
                <Center mb="md">
                  <DonutChart
                    data={donutExpenseData}
                    size={200}
                    thickness={30}
                    withLabels
                    withLabelsLine
                  />
                </Center>
                <Stack gap="xs">
                  {expenseStats.slice(0, 5).map((stat) => (
                    <Group key={stat.categoryId} justify="space-between">
                      <Group gap="xs">
                        <ColorSwatch color={stat.color} size={12} />
                        <Text size="sm">{stat.categoryName}</Text>
                      </Group>
                      <div style={{ textAlign: 'right' }}>
                        <Text size="sm" fw={500}>
                          {DataManager.formatAmount(stat.amount)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {stat.percentage.toFixed(1)}%
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Center h={200}>
                <Text c="dimmed">支出データがありません</Text>
              </Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* 詳細統計 */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="md" radius="lg" p="xl">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  詳細統計
                </Text>
                <Text size="sm" c="dimmed">
                  期間中の詳細な分析データ
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg" color="blue">
                <IconReportAnalytics size={20} />
              </ThemeIcon>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Paper withBorder p="md" radius="md">
                <Text size="sm" c="dimmed" mb="xs">日平均収入</Text>
                <Text size="lg" fw={600} c="teal">
                  {DataManager.formatAmount(dailyAverages.income)}
                </Text>
              </Paper>
              <Paper withBorder p="md" radius="md">
                <Text size="sm" c="dimmed" mb="xs">日平均支出</Text>
                <Text size="lg" fw={600} c="red">
                  {DataManager.formatAmount(dailyAverages.expense)}
                </Text>
              </Paper>
              <Paper withBorder p="md" radius="md">
                <Text size="sm" c="dimmed" mb="xs">取引件数</Text>
                <Text size="lg" fw={600}>
                  {summary.transactionCount.toLocaleString()}件
                </Text>
              </Paper>
              <Paper withBorder p="md" radius="md">
                <Text size="sm" c="dimmed" mb="xs">期間</Text>
                <Text size="lg" fw={600}>
                  {period === 'custom' && dateFrom && dateTo 
                    ? `${dayjs(dateFrom).format('YYYY/MM/DD')} - ${dayjs(dateTo).format('YYYY/MM/DD')}`
                    : period === 'month' ? '過去6ヶ月'
                    : period === 'quarter' ? '過去4四半期'
                    : '過去3年'
                  }
                </Text>
              </Paper>
            </SimpleGrid>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="md" radius="lg" p="xl" h="100%">
            <Group justify="space-between" mb="lg">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  アドバイス
                </Text>
                <Text size="sm" c="dimmed">
                  データに基づく提案
                </Text>
              </div>
              <ThemeIcon variant="light" size="lg" color="yellow">
                <IconInfoCircle size={20} />
              </ThemeIcon>
            </Group>

            <Stack gap="md">
              {summary.savingsRate > 20 && (
                <Alert color="green" radius="md">
                  <Text size="sm">
                    優秀な貯蓄率です！現在の家計管理を継続しましょう。
                  </Text>
                </Alert>
              )}
              
              {summary.savingsRate < 10 && summary.savingsRate >= 0 && (
                <Alert color="yellow" radius="md">
                  <Text size="sm">
                    貯蓄率が低めです。支出の見直しを検討してみてください。
                  </Text>
                </Alert>
              )}
              
              {summary.balance < 0 && (
                <Alert color="red" radius="md">
                  <Text size="sm">
                    支出が収入を上回っています。家計の見直しが必要です。
                  </Text>
                </Alert>
              )}

              {expenseStats.length > 0 && expenseStats[0].percentage > 40 && (
                <Alert color="blue" radius="md">
                  <Text size="sm">
                    「{expenseStats[0].categoryName}」の支出割合が高めです。
                    他のカテゴリとバランスを確認してみてください。
                  </Text>
                </Alert>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Statistics;