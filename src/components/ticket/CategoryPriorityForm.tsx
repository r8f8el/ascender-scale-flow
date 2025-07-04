
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryPriorityFormProps {
  categories: any[];
  priorities: any[];
  onSelectChange: (name: string, value: string) => void;
}

export const CategoryPriorityForm: React.FC<CategoryPriorityFormProps> = ({
  categories,
  priorities,
  onSelectChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Categoria do Chamado *</Label>
        <Select onValueChange={(value) => onSelectChange('category_id', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Nível de Prioridade *</Label>
        <Select onValueChange={(value) => onSelectChange('priority_id', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority.id} value={priority.id}>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: priority.color }}
                  />
                  {priority.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
