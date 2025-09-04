import { useEffect, useState } from "react";
import { ArrowLeft, User, Filter, Search, Phone, Mail, Calendar, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface Colleague {
  id: number;
  name: string;
  phone: string;
  position: 'director' | 'manager' | 'seller' | 'courier';
  isActive: boolean;
  joinedDate?: string;
  lastActivity?: string;
  email: string;
  shop_id: number;
}

interface ColleagueListProps {
  onClose?: () => void;
}

const positionLabels = {
  director: 'Директор',
  manager: 'Менеджер', 
  seller: 'Продавец',
  courier: 'Курьер'
};

const positionColors = {
  director: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  seller: 'bg-green-100 text-green-800', 
  courier: 'bg-orange-100 text-orange-800'
};

const positionIcons = {
  director: '👑',
  manager: '⭐',
  seller: '🌸',
  courier: '🚴'
};

export function ColleaguesList({ onClose }: ColleagueListProps) {
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [positionStats, setPositionStats] = useState<Record<string, number>>({});
  
  useEffect(() => {
    loadColleagues();
  }, [selectedPosition]);

  const loadColleagues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        access_token: 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144',
        limit: '200',
        offset: '0'
      });
      
      if (selectedPosition !== 'all') {
        params.set('position', selectedPosition);
      }
      
      const response = await fetch(`/api/v2/colleagues/?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setColleagues(data.data.items || []);
        setPositionStats(data.data.position_stats || {});
      }
    } catch (error) {
      console.error('Error loading colleagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleagues = colleagues.filter(colleague =>
    colleague.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colleague.phone.includes(searchQuery) ||
    colleague.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Неизвестно';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActivityStatus = (lastActivity?: string) => {
    if (!lastActivity) return 'Никогда';
    
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return `${Math.floor(diffDays / 30)} мес. назад`;
  };

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 mr-3"
          onClick={onClose}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-gray-900">Коллеги ({filteredColleagues.length})</h1>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по имени, телефону, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Position Filter Tags */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPosition === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPosition('all')}
            className="text-xs"
          >
            Все ({positionStats.director + positionStats.manager + positionStats.seller + positionStats.courier || 0})
          </Button>
          
          {Object.entries(positionLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedPosition === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPosition(key)}
              className="text-xs"
            >
              {positionIcons[key as keyof typeof positionIcons]} {label} ({positionStats[key] || 0})
            </Button>
          ))}
        </div>
      </div>

      {/* Colleagues List */}
      <div className="pb-6">
        {loading ? (
          <div className="p-4 text-center">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : filteredColleagues.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-gray-900 mb-1">Никого не найдено</div>
            <div className="text-sm text-gray-500">Попробуйте изменить фильтры</div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredColleagues.map((colleague) => (
              <div key={colleague.id} className="p-4 border-b border-gray-50 hover:bg-gray-25">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{positionIcons[colleague.position]}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{colleague.name}</h3>
                        <Badge className={`text-xs px-2 py-0 ${positionColors[colleague.position]}`}>
                          {positionLabels[colleague.position]}
                        </Badge>
                      </div>
                      
                      {colleague.phone && (
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{colleague.phone}</span>
                        </div>
                      )}
                      
                      {colleague.email && (
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{colleague.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>С {formatDate(colleague.joinedDate)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          <span>{getActivityStatus(colleague.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${colleague.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}