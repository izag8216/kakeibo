import { useState, useEffect } from 'react';
import { AppData } from '../types';

const DATA_FILE_PATH = '/data.txt';

export function useLocalStorage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを読み込む
  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(DATA_FILE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      
      const text = await response.text();
      const jsonData = JSON.parse(text) as AppData;
      setData(jsonData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading data:', err);
      
      // エラーの場合はデフォルトデータを設定
      setData(getDefaultData());
    } finally {
      setLoading(false);
    }
  };

  // データを保存する
  const saveData = async (newData: AppData): Promise<void> => {
    try {
      setError(null);
      
      const updatedData = {
        ...newData,
        lastUpdated: new Date().toISOString()
      };
      
      // 実際のアプリケーションでは、ここでファイルに保存する処理を実装
      // 今回はローカルストレージに保存
      localStorage.setItem('kakeibo-data', JSON.stringify(updatedData));
      setData(updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving data:', err);
      throw err;
    }
  };

  // デフォルトデータを取得
  const getDefaultData = (): AppData => ({
    transactions: [],
    categories: [
      {
        id: 'income-salary',
        name: '給与',
        type: 'income',
        color: '#10b981'
      },
      {
        id: 'income-bonus',
        name: 'ボーナス',
        type: 'income',
        color: '#059669'
      },
      {
        id: 'expense-food',
        name: '食費',
        type: 'expense',
        color: '#ef4444'
      },
      {
        id: 'expense-transport',
        name: '交通費',
        type: 'expense',
        color: '#f97316'
      },
      {
        id: 'expense-utilities',
        name: '光熱費',
        type: 'expense',
        color: '#8b5cf6'
      },
      {
        id: 'expense-entertainment',
        name: '娯楽',
        type: 'expense',
        color: '#06b6d4'
      }
    ],
    settings: {
      currency: '¥',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light'
    },
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  });

  // 初期データ読み込み
  useEffect(() => {
    // まずローカルストレージから読み込みを試行
    const savedData = localStorage.getItem('kakeibo-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as AppData;
        setData(parsedData);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error parsing saved data:', err);
      }
    }
    
    // ローカルストレージにデータがない場合は、data.txtから読み込み
    loadData();
  }, []);

  // ダミーデータをロードする
  const loadDummyData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/data.txt');
      if (!response.ok) {
        throw new Error('Failed to load dummy data');
      }
      
      const text = await response.text();
      const dummyData = JSON.parse(text) as AppData;
      
      // ローカルストレージに保存
      localStorage.setItem('kakeibo-data', JSON.stringify(dummyData));
      setData(dummyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dummy data';
      setError(errorMessage);
      console.error('Error loading dummy data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    saveData,
    loadData,
    loadDummyData
  };
}