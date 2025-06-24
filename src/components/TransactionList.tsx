import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Pagination,
  Text,
  Title,
  Tooltip,
  Box,
  Checkbox,
  Menu,
  ThemeIcon,
  Paper,
  Center,
  ColorSwatch,
  Collapse,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconCheck,
  IconFileText,
} from '@tabler/icons-react';
import { Transaction, Category, TransactionFilters, SortField, SortOrder } from '../types';
import { DataManager } from '../utils/dataManager';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onEdit,
  onDelete,
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    description: '',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, { toggle: toggleFilters }] = useDisclosure(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // フィルタリングとソート
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = DataManager.filterTransactions(transactions, filters);
    return DataManager.sortTransactions(filtered, sortField, sortOrder);
  }, [transactions, filters, sortField, sortOrder]);

  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    modals.openConfirmModal({
      title: '選択した取引を削除',
      children: (
        <Text size="sm">
          選択した{selectedIds.length}件の取引を削除しますか？この操作は元に戻せません。
        </Text>
      ),
      labels: { confirm: '削除', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        selectedIds.forEach(id => onDelete(id));
        setSelectedIds([]);
        notifications.show({
          title: '削除完了',
          message: `${selectedIds.length}件の取引を削除しました`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      },
    });
  };

  const handleDeleteSingle = (transaction: Transaction) => {
    modals.openConfirmModal({
      title: '取引を削除',
      children: (
        <Stack gap="sm">
          <Text size="sm">以下の取引を削除しますか？</Text>
          <Paper p="sm" bg="gray.0" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {getCategoryName(transaction.category)}
                </Text>
                <Text size="xs" c="dimmed">
                  {DataManager.formatDate(transaction.date, 'MM/DD')}
                </Text>
              </div>
              <Badge
                color={transaction.type === 'income' ? 'teal' : 'red'}
                variant="light"
              >
                {transaction.type === 'income' ? '+' : '-'}
                {DataManager.formatAmount(transaction.amount)}
              </Badge>
            </Group>
          </Paper>
        </Stack>
      ),
      labels: { confirm: '削除', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onDelete(transaction.id);
        notifications.show({
          title: '削除完了',
          message: '取引を削除しました',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      },
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="subtle"
      size="xs"
      onClick={() => handleSort(field)}
      rightSection={
        sortField === field ? (
          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
        ) : null
      }
      color={sortField === field ? 'blue' : 'gray'}
    >
      {children}
    </Button>
  );

  return (
    <Stack gap="lg">
      {/* ヘッダー */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} mb="xs">取引履歴</Title>
          <Text c="dimmed">全ての取引を管理・編集できます</Text>
        </Box>
        <Group gap="md">
          <Button
            leftSection={<IconFilter size={16} />}
            variant={showFilters ? 'filled' : 'light'}
            onClick={toggleFilters}
          >
            フィルター
          </Button>
          {selectedIds.length > 0 && (
            <Button
              leftSection={<IconTrash size={16} />}
              color="red"
              variant="light"
              onClick={handleBulkDelete}
            >
              削除 ({selectedIds.length})
            </Button>
          )}
        </Group>
      </Group>

      {/* フィルター */}
      <Collapse in={showFilters}>
        <Card shadow="sm" radius="md" p="lg" withBorder>
          <Text fw={500} mb="md" size="sm">
            検索とフィルター
          </Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="取引タイプ"
                value={filters.type || 'all'}
                onChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value as 'income' | 'expense')}
                data={[
                  { value: 'all', label: 'すべて' },
                  { value: 'income', label: '収入' },
                  { value: 'expense', label: '支出' },
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="カテゴリ"
                placeholder="すべて"
                value={filters.category || ''}
                onChange={(value) => handleFilterChange('category', value || undefined)}
                data={[
                  { value: '', label: 'すべて' },
                  ...categories.map(category => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
                clearable
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <DateInput
                label="開始日"
                placeholder="日付を選択"
                value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                onChange={(date) => handleFilterChange('dateFrom', date?.toISOString().split('T')[0])}
                clearable
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <DateInput
                label="終了日"
                placeholder="日付を選択"
                value={filters.dateTo ? new Date(filters.dateTo) : null}
                onChange={(date) => handleFilterChange('dateTo', date?.toISOString().split('T')[0])}
                clearable
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="説明で検索"
                placeholder="取引の説明を入力..."
                leftSection={<IconSearch size={16} />}
                value={filters.description || ''}
                onChange={(event) => handleFilterChange('description', event.currentTarget.value || undefined)}
              />
            </Grid.Col>
          </Grid>
        </Card>
      </Collapse>

      {/* 取引リスト */}
      <Card shadow="md" radius="lg" p="xl">
        {filteredAndSortedTransactions.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} variant="light" color="gray">
                <IconFileText size={30} />
              </ThemeIcon>
              <Text c="dimmed">取引がありません</Text>
              <Text size="sm" c="dimmed">
                フィルター条件を変更するか、新しい取引を追加してください
              </Text>
            </Stack>
          </Center>
        ) : (
          <>
            {/* デスクトップテーブル */}
            <Box visibleFrom="md">
              <Table highlightOnHover verticalSpacing="md">
                <thead>
                  <tr>
                    <th>
                      <Checkbox
                        checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedTransactions.length}
                        onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                      />
                    </th>
                    <th><SortButton field="date">日付</SortButton></th>
                    <th>タイプ</th>
                    <th><SortButton field="amount">金額</SortButton></th>
                    <th><SortButton field="category">カテゴリ</SortButton></th>
                    <th><SortButton field="description">説明</SortButton></th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onChange={(event) => handleSelectItem(transaction.id, event.currentTarget.checked)}
                        />
                      </td>
                      <td>
                        <Text size="sm">
                          {DataManager.formatDate(transaction.date, 'MM/DD')}
                        </Text>
                      </td>
                      <td>
                        <Badge
                          variant="light"
                          color={transaction.type === 'income' ? 'teal' : 'red'}
                          size="sm"
                        >
                          {transaction.type === 'income' ? '収入' : '支出'}
                        </Badge>
                      </td>
                      <td>
                        <Text
                          fw={500}
                          color={transaction.type === 'income' ? 'teal' : 'red'}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {DataManager.formatAmount(transaction.amount)}
                        </Text>
                      </td>
                      <td>
                        <Group gap="sm">
                          <ColorSwatch
                            color={getCategoryColor(transaction.category)}
                            size={16}
                          />
                          <Text size="sm">{getCategoryName(transaction.category)}</Text>
                        </Group>
                      </td>
                      <td>
                        <Text size="sm" lineClamp={1} maw={200}>
                          {transaction.description || '-'}
                        </Text>
                      </td>
                      <td>
                        <Group gap="xs">
                          <Tooltip label="編集">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => onEdit(transaction)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="削除">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteSingle(transaction)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>

            {/* モバイルカード */}
            <Box hiddenFrom="md">
              <Stack gap="md">
                {paginatedTransactions.map((transaction) => (
                  <Card key={transaction.id} withBorder radius="md" p="md">
                    <Group justify="space-between" mb="sm">
                      <Group gap="sm">
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onChange={(event) => handleSelectItem(transaction.id, event.currentTarget.checked)}
                        />
                        <Text size="sm" c="dimmed">
                          {DataManager.formatDate(transaction.date, 'MM/DD')}
                        </Text>
                      </Group>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(transaction)}
                          >
                            編集
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDeleteSingle(transaction)}
                          >
                            削除
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Group justify="space-between" mb="sm">
                      <Group gap="sm">
                        <ColorSwatch
                          color={getCategoryColor(transaction.category)}
                          size={16}
                        />
                        <Text size="sm" fw={500}>
                          {getCategoryName(transaction.category)}
                        </Text>
                      </Group>
                      <Badge
                        variant="light"
                        color={transaction.type === 'income' ? 'teal' : 'red'}
                      >
                        {transaction.type === 'income' ? '収入' : '支出'}
                      </Badge>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                        {transaction.description || '説明なし'}
                      </Text>
                      <Text
                        fw={600}
                        color={transaction.type === 'income' ? 'teal' : 'red'}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {DataManager.formatAmount(transaction.amount)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* ページネーション */}
            {totalPages > 1 && (
              <Group justify="space-between" mt="xl">
                <Text size="sm" c="dimmed">
                  {filteredAndSortedTransactions.length}件中 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)}件を表示
                </Text>
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setCurrentPage}
                  size="sm"
                />
              </Group>
            )}
          </>
        )}
      </Card>
    </Stack>
  );
};

export default TransactionList;