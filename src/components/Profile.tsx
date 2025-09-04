import { useEffect, useState } from "react";
import { ArrowLeft, User, Store, Users, Edit3, Check, X, Plus, Trash2, Phone, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ColleaguesList } from "./ColleaguesList";
import { 
  getProfile, 
  updateProfile as apiUpdateProfile, 
  getShopInfo, 
  updateShopInfo as apiUpdateShopInfo, 
  listColleagues, 
  createColleague as apiCreateColleague, 
  toggleColleague as apiToggleColleague, 
  deleteColleague as apiDeleteColleague 
} from "../api/profile";

interface FloristProfile {
  id: number;
  name: string;
  phone: string;
  position: 'owner' | 'senior' | 'florist' | 'assistant';
  bio?: string;
}

interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  description?: string;
}

interface Colleague {
  id: number;
  name: string;
  phone: string;
  position: 'owner' | 'senior' | 'florist' | 'assistant';
  isActive: boolean;
  joinedDate: Date;
}

interface ProfileProps {
  onClose?: () => void;
  showHeader?: boolean;
}

export function Profile({ onClose, showHeader = true }: ProfileProps) {
  // Мок-данные профиля
  const [floristProfile, setFloristProfile] = useState<FloristProfile | null>(null);

  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [showColleaguesList, setShowColleaguesList] = useState(false);

  const [editingSection, setEditingSection] = useState<'profile' | 'shop' | 'colleagues' | null>(null);
  const [tempProfile, setTempProfile] = useState<FloristProfile | null>(null);
  const [tempShop, setTempShop] = useState<ShopInfo | null>(null);
  const [newColleague, setNewColleague] = useState<Partial<Colleague>>({
    name: '',
    phone: '',
    position: 'assistant'
  });

  const positionLabels = {
    owner: 'Владелец',
    senior: 'Старший флорист',
    florist: 'Флорист',
    assistant: 'Помощник'
  };

  const handleSaveProfile = async () => {
    if (!tempProfile || !floristProfile) return;
    try {
      const payload: any = { id: floristProfile.id };
      if (tempProfile.name !== floristProfile.name) payload.name = tempProfile.name;
      if (tempProfile.phone !== floristProfile.phone) payload.phone = tempProfile.phone;
      if (tempProfile.position !== floristProfile.position) payload.position = tempProfile.position;
      if (tempProfile.bio !== floristProfile.bio) payload.bio = tempProfile.bio;
      const res = await apiUpdateProfile(payload);
      if (res?.success) {
        setFloristProfile({
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          position: res.data.position,
          bio: res.data.bio || undefined,
        });
        setEditingSection(null);
      }
    } catch (e) {
      console.warn('Failed to update profile', e);
    }
  };

  const handleSaveShop = async () => {
    if (!tempShop || !shopInfo) return;
    try {
      const payload: any = { id: (shopInfo as any).id || 1 };
      if (tempShop.name !== shopInfo.name) payload.name = tempShop.name;
      if (tempShop.address !== shopInfo.address) payload.address = tempShop.address;
      if (tempShop.phone !== shopInfo.phone) payload.phone = tempShop.phone;
      if (tempShop.workingHours !== shopInfo.workingHours) payload.working_hours = tempShop.workingHours;
      if (tempShop.description !== shopInfo.description) payload.description = tempShop.description;
      const res = await apiUpdateShopInfo(payload);
      if (res?.success) {
        setShopInfo({
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
          workingHours: res.data.working_hours,
          description: res.data.description,
        });
        setEditingSection(null);
      }
    } catch (e) {
      console.warn('Failed to update shop info', e);
    }
  };

  const handleCancelEdit = () => {
    if (floristProfile) setTempProfile(floristProfile);
    if (shopInfo) setTempShop(shopInfo);
    setEditingSection(null);
  };

  const handleAddColleague = async () => {
    if (newColleague.name && newColleague.phone && newColleague.position) {
      try {
        const res = await apiCreateColleague({
          name: newColleague.name,
          phone: newColleague.phone,
          position: newColleague.position as any,
          isActive: true,
        });
        if (res?.success && res.data) {
          setColleagues([
            ...colleagues,
            {
              id: res.data.id,
              name: res.data.name,
              phone: res.data.phone,
              position: res.data.position,
              isActive: res.data.isActive,
              joinedDate: res.data.joinedDate ? new Date(res.data.joinedDate) : new Date(),
            },
          ]);
        }
      } catch (e) {
        console.warn('Failed to create colleague', e);
      }
      setNewColleague({ name: '', phone: '', position: 'assistant' });
    }
  };

  const handleToggleColleague = async (id: number) => {
    const target = colleagues.find(c => c.id === id);
    if (!target) return;
    try {
      const res = await apiToggleColleague(id, !target.isActive);
      if (res?.success) {
        setColleagues(prev => prev.map(c => c.id === id ? { ...c, isActive: res.data.isActive } : c));
      }
    } catch (e) {
      console.warn('Failed to toggle colleague', e);
    }
  };

  const handleRemoveColleague = async (id: number) => {
    try {
      const res = await apiDeleteColleague(id);
      if (res?.success) {
        setColleagues(prev => prev.filter(colleague => colleague.id !== id));
      }
    } catch (e) {
      console.warn('Failed to delete colleague', e);
    }
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, cols] = await Promise.all([
          getProfile(),
          getShopInfo(),
          listColleagues({}),
        ]);
        if (p?.success && p.data) {
          const fp: FloristProfile = {
            id: p.data.id,
            name: p.data.name,
            phone: p.data.phone,
            position: p.data.position,
            bio: p.data.bio || undefined,
          };
          setFloristProfile(fp);
          setTempProfile(fp);
        }
        if (s?.success && s.data) {
          const si: ShopInfo = {
            name: s.data.name,
            address: s.data.address,
            phone: s.data.phone,
            workingHours: s.data.working_hours,
            description: s.data.description,
          } as any;
          (si as any).id = s.data.id;
          setShopInfo(si);
          setTempShop(si);
        }
        if (cols?.success) {
          const list: Colleague[] = (cols.data?.items || []).map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            position: c.position,
            isActive: c.isActive,
            joinedDate: c.joinedDate ? new Date(c.joinedDate) : new Date(),
          }));
          setColleagues(list);
        }
      } catch (e) {
        console.warn('Failed to load profile page data', e);
      }
    };
    load();
  }, []);

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

              {editingSection === 'profile' && tempProfile ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Имя</label>
                <Input
                  value={tempProfile?.name || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                <Input
                  value={tempProfile?.phone || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Должность</label>
                <Select 
                  value={tempProfile?.position || 'florist'} 
                  onValueChange={(value: any) => setTempProfile({ ...tempProfile, position: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Владелец</SelectItem>
                    <SelectItem value="senior">Старший флорист</SelectItem>
                    <SelectItem value="florist">Флорист</SelectItem>
                    <SelectItem value="assistant">Помощник</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div>
                <label className="text-sm text-gray-600 mb-1 block">О себе</label>
                <Textarea
                  value={tempProfile?.bio || ''}
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
              {floristProfile && (
                <>
                  <div>
                    <div className="text-gray-900">{floristProfile.name}</div>
                    <div className="text-sm text-gray-600">{positionLabels[floristProfile.position]}</div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{floristProfile.phone}</span>
                  </div>
                  {floristProfile.bio && (
                    <div className="text-sm text-gray-600 pt-2">
                      {floristProfile.bio}
                    </div>
                  )}
                </>
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

          {editingSection === 'shop' && tempShop ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Название</label>
                <Input
                  value={tempShop?.name || ''}
                  onChange={(e) => setTempShop({ ...tempShop, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Адрес</label>
                <Input
                  value={tempShop?.address || ''}
                  onChange={(e) => setTempShop({ ...tempShop, address: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                <Input
                  value={tempShop?.phone || ''}
                  onChange={(e) => setTempShop({ ...tempShop, phone: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Часы работы</label>
                <Input
                  value={tempShop?.workingHours || ''}
                  onChange={(e) => setTempShop({ ...tempShop, workingHours: e.target.value })}
                  className="h-12"
                  placeholder="например: Пн-Вс: 09:00 - 21:00"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Описание</label>
                <Textarea
                  value={tempShop?.description || ''}
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
              {shopInfo ? (
                <>
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
                </>
              ) : (
                <div className="text-gray-500">Загрузка...</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Colleagues section */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-gray-900">Коллеги ({colleagues.length})</h3>
        </div>
        {colleagues.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-gray-900 mb-1">Нет коллег</h4>
            <p className="text-sm text-gray-500">Коллеги появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            {colleagues.slice(0, 5).map((colleague) => (
              <div key={colleague.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{colleague.name}</div>
                    <div className="text-xs text-gray-500">
                      {positionLabels[colleague.position] || colleague.position}
                      {colleague.phone && ` • ${colleague.phone}`}
                    </div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${colleague.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            ))}
            {colleagues.length > 5 && (
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => setShowColleaguesList(true)}
              >
                Показать всех коллег ({colleagues.length})
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Colleagues List Modal */}
      {showColleaguesList && (
        <div className="fixed inset-0 bg-white z-50">
          <ColleaguesList onClose={() => setShowColleaguesList(false)} />
        </div>
      )}
    </div>
  );
}
