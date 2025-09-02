// Temporary stub components for routes that are not yet implemented
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className="p-2 hover:bg-gray-100 rounded inline-flex items-center gap-2"
    >
      <ArrowLeft className="w-5 h-5" />
      Назад
    </button>
  );
};

export function Orders() {
  const navigate = useNavigate();
  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Заказы</h1>
      <p className="text-gray-600">Раздел заказов в разработке</p>
      <button 
        onClick={() => navigate('/orders/add')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Добавить заказ
      </button>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/orders" />
      <h1 className="text-2xl font-bold mb-4">Заказ #{id}</h1>
      <p className="text-gray-600">Детали заказа в разработке</p>
    </div>
  );
}

export function AddOrder() {
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/orders" />
      <h1 className="text-2xl font-bold mb-4">Новый заказ</h1>
      <p className="text-gray-600">Форма создания заказа в разработке</p>
    </div>
  );
}

export function Inventory() {
  const navigate = useNavigate();
  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Склад</h1>
      <p className="text-gray-600">Управление складом в разработке</p>
      <div className="mt-4 space-x-2">
        <button 
          onClick={() => navigate('/inventory/supply')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Принять поставку
        </button>
        <button 
          onClick={() => navigate('/inventory/audit')}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Инвентаризация
        </button>
      </div>
    </div>
  );
}

export function AddInventoryItem() {
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/inventory" />
      <h1 className="text-2xl font-bold mb-4">Принять поставку</h1>
      <p className="text-gray-600">Форма приема товара в разработке</p>
    </div>
  );
}

export function InventoryItemDetail() {
  const { id } = useParams();
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/inventory" />
      <h1 className="text-2xl font-bold mb-4">Товар склада #{id}</h1>
      <p className="text-gray-600">Детали товара в разработке</p>
    </div>
  );
}

export function InventoryAudit() {
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/inventory" />
      <h1 className="text-2xl font-bold mb-4">Инвентаризация</h1>
      <p className="text-gray-600">Процесс инвентаризации в разработке</p>
    </div>
  );
}

export function Customers() {
  const navigate = useNavigate();
  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Клиенты</h1>
      <p className="text-gray-600">База клиентов в разработке</p>
      <button 
        onClick={() => navigate('/customers/add')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Добавить клиента
      </button>
    </div>
  );
}

export function CustomerDetail() {
  const { id } = useParams();
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/customers" />
      <h1 className="text-2xl font-bold mb-4">Клиент #{id}</h1>
      <p className="text-gray-600">Информация о клиенте в разработке</p>
    </div>
  );
}

export function AddCustomer() {
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/customers" />
      <h1 className="text-2xl font-bold mb-4">Новый клиент</h1>
      <p className="text-gray-600">Форма добавления клиента в разработке</p>
    </div>
  );
}

export function Profile() {
  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <p className="text-gray-600">Настройки профиля в разработке</p>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="bg-white min-h-screen p-4">
      <BackButton to="/" />
      <h1 className="text-2xl font-bold mb-4">Дашборд</h1>
      <p className="text-gray-600">Аналитика и статистика в разработке</p>
    </div>
  );
}