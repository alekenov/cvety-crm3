import { useState, useEffect } from "react";
import { ArrowLeft, User, Store, Users, Edit3, Check, X, Plus, Trash2, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
// API imports
import { getProfile, updateProfile, getShopInfo, updateShopInfo, listColleagues, createColleague, updateColleague, toggleColleague, deleteColleague } from "../api/profile";
import type { FloristProfileDTO, ShopInfoDTO, ColleagueDTO } from "../api/profile";

// Use flexible types that handle both old and new API data
type FloristProfile = Omit<FloristProfileDTO, 'position'> & { 
  position: 'director' | 'manager' | 'seller' | 'courier' | 'owner' | 'senior' | 'florist' | 'assistant'; 
};
type ShopInfo = ShopInfoDTO & { workingHours: string }; // Add workingHours mapping  
type Colleague = Omit<ColleagueDTO, 'position'> & { 
  position: 'director' | 'manager' | 'seller' | 'courier' | 'owner' | 'senior' | 'florist' | 'assistant';
  joinedDate: Date; 
};

interface ProfileProps {
  onClose?: () => void;
  showHeader?: boolean;
}

export function Profile({ onClose, showHeader = true }: ProfileProps) {
  // Real API data state
  const [floristProfile, setFloristProfile] = useState<FloristProfile | null>(null);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<'profile' | 'shop' | 'colleagues' | null>(null);
  const [tempProfile, setTempProfile] = useState<FloristProfile | null>(null);
  const [tempShop, setTempShop] = useState<ShopInfo | null>(null);
  const [newColleague, setNewColleague] = useState<Partial<ColleagueDTO>>({
    name: '',
    phone: '',
    position: 'assistant'
  });
  const [editingColleagueId, setEditingColleagueId] = useState<number | null>(null);
  const [tempColleague, setTempColleague] = useState<Colleague | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load profile, shop info and colleagues in parallel
        const [profileRes, shopRes, colleaguesRes] = await Promise.all([
          getProfile().catch(() => ({ success: true, data: null })),
          getShopInfo().catch(() => ({ success: true, data: null })),
          listColleagues().catch(() => ({ success: true, data: [], pagination: null }))
        ]);

        if (profileRes.data) {
          const profile = profileRes.data;
          setFloristProfile(profile);
          setTempProfile(profile);
        }

        if (shopRes.data) {
          const shop = { ...shopRes.data, workingHours: shopRes.data.working_hours || "Пн-Вс: 09:00 - 21:00" };
          setShopInfo(shop);
          setTempShop(shop);
        }

        if (colleaguesRes.data && colleaguesRes.data.items) {
          const mappedColleagues = colleaguesRes.data.items.map(c => ({
            ...c,
            joinedDate: c.joinedDate ? new Date(c.joinedDate) : new Date()
          }));
          setColleagues(mappedColleagues);
        }

      } catch (err) {
        setError('Не удалось загрузить данные профиля');
        console.error('Error loading profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const positionLabels = {
    director: 'Директор',
    manager: 'Менеджер', 
    seller: 'Продавец',
    courier: 'Курьер',
    // Also support new API positions if they come
    owner: 'Владелец',
    senior: 'Старший флорист',
    florist: 'Флорист',
    assistant: 'Помощник'
  };

  const handleSaveProfile = () => {
    setFloristProfile(tempProfile);
    setEditingSection(null);
  };

  const handleSaveShop = () => {
    setShopInfo(tempShop);
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setTempProfile(floristProfile);
    setTempShop(shopInfo);
    setEditingSection(null);
    setEditingColleagueId(null);
    setTempColleague(null);
  };

  const handleAddColleague = () => {
    if (newColleague.name && newColleague.phone && newColleague.position) {
      const colleague: Colleague = {
        id: Date.now(),
        name: newColleague.name,
        phone: newColleague.phone,
        position: newColleague.position as any,
        isActive: true,
        joinedDate: new Date()
      };
      setColleagues([...colleagues, colleague]);
      setNewColleague({ name: '', phone: '', position: 'courier' });
    }
  };

  const handleToggleColleague = (id: number) => {
    setColleagues(prev =>
      prev.map(colleague =>
        colleague.id === id
          ? { ...colleague, isActive: !colleague.isActive }
          : colleague
      )
    );
  };

  const handleRemoveColleague = (id: number) => {
    setColleagues(prev => prev.filter(colleague => colleague.id !== id));
  };

  const handleEditColleague = (colleague: Colleague) => {
    setEditingColleagueId(colleague.id);
    setTempColleague({ ...colleague });
  };

  const handleSaveColleague = () => {
    if (tempColleague && editingColleagueId) {
      setColleagues(prev =>
        prev.map(colleague =>
          colleague.id === editingColleagueId
            ? tempColleague
            : colleague
        )
      );
      setEditingColleagueId(null);
      setTempColleague(null);
    }
  };

  const handleCancelColleagueEdit = () => {
    setEditingColleagueId(null);
    setTempColleague(null);
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto">
        {showHeader && (
          <div className="flex items-center p-4 border-b border-gray-100">
            <Button variant="ghost" size="sm" className="p-2 mr-3" onClick={onClose}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <h1 className="text-gray-900">Профиль</h1>
          </div>
        )}
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto">
        {showHeader && (
          <div className="flex items-center p-4 border-b border-gray-100">
            <Button variant="ghost" size="sm" className="p-2 mr-3" onClick={onClose}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <h1 className="text-gray-900">Профиль</h1>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center p-4 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 mr-3"
            onClick={onClose}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-gray-900">Профиль</h1>
        </div>
      )}
      
      {!showHeader && (
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-gray-900">Профиль</h1>
        </div>
      )}

      <div className={showHeader ? "pb-6" : "pb-20"}>
        {/* Florist Profile Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900">Личные данные</h2>
            {editingSection !== 'profile' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1"
                onClick={() => setEditingSection('profile')}
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </Button>
            )}
          </div>

          {editingSection === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Имя</label>
                <Input
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                <Input
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Должность</label>
                <Select 
                  value={tempProfile.position} 
                  onValueChange={(value: any) => setTempProfile({ ...tempProfile, position: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">Директор</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="seller">Продавец</SelectItem>
                    <SelectItem value="courier">Курьер</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div>
                <label className="text-sm text-gray-600 mb-1 block">О себе</label>
                <Textarea
                  value={tempProfile.bio || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                  className="min-h-[80px] resize-none"
                  placeholder="Расскажите о себе и подходе к работе..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSaveProfile}
                >
                  Сохранить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-gray-900">{floristProfile?.name || 'Имя не указано'}</div>
                <div className="text-sm text-gray-600">
                  {floristProfile?.position ? positionLabels[floristProfile.position] || floristProfile.position : 'Должность не указана'}
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{floristProfile?.phone || 'Телефон не указан'}</span>
              </div>
              {floristProfile?.bio && (
                <div className="text-sm text-gray-600 pt-2">
                  {floristProfile.bio}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shop Info Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900">Информация о магазине</h2>
            {editingSection !== 'shop' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1"
                onClick={() => setEditingSection('shop')}
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </Button>
            )}
          </div>

          {editingSection === 'shop' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Название</label>
                <Input
                  value={tempShop.name}
                  onChange={(e) => setTempShop({ ...tempShop, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Адрес</label>
                <Input
                  value={tempShop.address}
                  onChange={(e) => setTempShop({ ...tempShop, address: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                <Input
                  value={tempShop.phone}
                  onChange={(e) => setTempShop({ ...tempShop, phone: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Часы работы</label>
                <Input
                  value={tempShop.workingHours}
                  onChange={(e) => setTempShop({ ...tempShop, workingHours: e.target.value })}
                  className="h-12"
                  placeholder="например: Пн-Вс: 09:00 - 21:00"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Описание</label>
                <Textarea
                  value={tempShop.description || ''}
                  onChange={(e) => setTempShop({ ...tempShop, description: e.target.value })}
                  className="min-h-[80px] resize-none"
                  placeholder="Расскажите о вашем магазине..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSaveShop}
                >
                  Сохранить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-gray-900">{shopInfo.name}</div>
              </div>
              <div className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{shopInfo.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{shopInfo.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">{shopInfo.workingHours}</span>
              </div>
              {shopInfo.description && (
                <div className="text-sm text-gray-600 pt-2">
                  {shopInfo.description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="p-4">
          <div className="mb-3">
            <h2 className="text-gray-900">Команда</h2>
          </div>

          {/* Add New Colleague */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="text-gray-900 mb-2">Добавить коллегу</h3>
            <div className="space-y-2">
              <Input
                placeholder="Имя"
                value={newColleague.name || ''}
                onChange={(e) => setNewColleague({ ...newColleague, name: e.target.value })}
              />
              <Input
                placeholder="Телефон"
                value={newColleague.phone || ''}
                onChange={(e) => setNewColleague({ ...newColleague, phone: e.target.value })}
              />
              <Select 
                value={newColleague.position || 'courier'} 
                onValueChange={(value: any) => setNewColleague({ ...newColleague, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Должность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Директор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="seller">Продавец</SelectItem>
                  <SelectItem value="courier">Курьер</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddColleague}
                disabled={!newColleague.name || !newColleague.phone}
                className="w-full"
              >
                Добавить
              </Button>
            </div>
          </div>

          {/* Colleagues List */}
          <div className="space-y-3">
            {colleagues.map((colleague) => (
              <div 
                key={colleague.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                {editingColleagueId === colleague.id && tempColleague ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Имя</label>
                      <Input
                        value={tempColleague.name}
                        onChange={(e) => setTempColleague({ ...tempColleague, name: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                      <Input
                        value={tempColleague.phone}
                        onChange={(e) => setTempColleague({ ...tempColleague, phone: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Должность</label>
                      <Select 
                        value={tempColleague.position} 
                        onValueChange={(value: any) => setTempColleague({ ...tempColleague, position: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="director">Директор</SelectItem>
                          <SelectItem value="manager">Менеджер</SelectItem>
                          <SelectItem value="seller">Продавец</SelectItem>
                          <SelectItem value="courier">Курьер</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveColleague}
                        size="sm"
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancelColleagueEdit}
                        size="sm"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className={`${colleague.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {colleague.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{positionLabels[colleague.position]}</div>
                      <div className="text-sm text-gray-500">{colleague.phone}</div>
                      <div className="text-xs text-gray-400">
                        С {formatJoinDate(colleague.joinedDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleEditColleague(colleague)}
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleToggleColleague(colleague.id)}
                      >
                        {colleague.isActive ? (
                          <X className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Check className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleRemoveColleague(colleague.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {colleagues.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-gray-900 mb-1">Нет коллег</h4>
                <p className="text-sm text-gray-500">Добавьте первого коллегу в команду</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}