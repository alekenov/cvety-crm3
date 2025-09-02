import { useState } from "react";
import { ArrowLeft, Phone, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Temporary inline components to avoid import issues
function PageHeader({ title, subtitle, onBack, actions }: { 
  title: string; 
  subtitle?: string; 
  onBack?: () => void; 
  actions?: React.ReactNode; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 mr-3">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        )}
        <div>
          <h1 className="text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
  );
}

interface AddCustomerProps {
  onClose: () => void;
  onCreateCustomer: (customerData: {
    name: string;
    phone: string;
  }) => void;
}

export function AddCustomer({ onClose, onCreateCustomer }: AddCustomerProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +7 (XXX) XXX-XX-XX
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)})`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.phone.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    try {
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      };
      
      onCreateCustomer(customerData);
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      <PageHeader 
        title="Новый клиент" 
        onBack={onClose}
      />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-900">
            <User className="w-4 h-4 text-gray-500" />
            Имя клиента
          </label>
          <Input
            type="text"
            placeholder="Введите имя"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full bg-input-background border-0 rounded-lg"
            maxLength={100}
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-900">
            <Phone className="w-4 h-4 text-gray-500" />
            Номер телефона
          </label>
          <Input
            type="tel"
            placeholder="+7 (777) 123-45-67"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full bg-input-background border-0 rounded-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Отменить
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Создать клиента'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}