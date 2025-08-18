
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Priority {
  id: string;
  name: string;
  color: string;
  urgency_level: number;
}

interface CategoryPriorityFormProps {
  categories: Category[];
  priorities: Priority[];
  onSelectChange: (field: string, value: string) => void;
}

export const CategoryPriorityForm: React.FC<CategoryPriorityFormProps> = ({
  categories,
  priorities,
  onSelectChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category_id">Categoria *</Label>
        <Select onValueChange={(value) => onSelectChange('category_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority_id">Prioridade *</Label>
        <Select onValueChange={(value) => onSelectChange('priority_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority.id} value={priority.id}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: priority.color }}
                  />
                  <span>{priority.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
